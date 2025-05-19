mod scanner;
mod yara;

use std::collections::HashMap;
use scanner::{Scanner, Match};
use clap::Parser;
use std::error::Error;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use std::sync::Mutex;
use sha2::{Sha256, Digest};
use base64::{Engine as _, engine::general_purpose::STANDARD};
use warp::Filter;
use warp::ws::{WebSocket, Message};
use futures_util::{SinkExt, StreamExt};

#[derive(Serialize, Deserialize, Clone)]
struct ScanRequest {
    hash: String,
    data: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct ScanResponse {
    results: HashMap<String, Vec<Match>>,
    hash: String,
    verdict: String,
    severity: String,
    score: u8,
}

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(short, long, default_value = "0.0.0.0:8081")]
    listen: String,
}

#[derive(Clone)]
struct AppState {
    hash_cache: Arc<Mutex<HashMap<String, ScanResponse>>>,
}

fn filter_relevant_results(results: &HashMap<String, Vec<Match>>) -> HashMap<String, Vec<Match>> {
    let mut filtered = HashMap::new();
    for (cat, matches) in results.iter() {
        if cat == "executables" || cat == "deprecated" {
            continue;
        }
        let filtered_matches: Vec<Match> = matches.iter()
            .filter(|m| m.category != "executables" && m.category != "deprecated")
            .cloned()
            .collect();
        if !filtered_matches.is_empty() {
            filtered.insert(cat.clone(), filtered_matches);
        }
    }
    filtered
}

fn calculate_verdict_severity_score(results: &HashMap<String, Vec<Match>>) -> (String, String, u8) {
    let mut score = 0.0;
    let mut n = 0;
    let mut max_severity = 0;
    let mut critical = false;
    let mut suspicious = false;
    let mut auth_high = 0;
    let mut filepath_high = 0;
    let mut classload_high = 0;
    for (cat, matches) in results.iter() {
        for m in matches {
            n += 1;
            let cat_weight = match cat.as_str() {
                "authentication" => if m.severity >= 4 { 0.9 } else { 0.5 },
                "file_paths" => if m.severity >= 3 { 0.7 } else { 0.2 },
                "class_loading" => if m.severity >= 3 { 0.7 } else { 0.2 },
                "obfuscation" => 0.2,
                "network" => 0.3,
                "reflection" => if m.severity >= 3 { 0.1 } else { 0.01 },
                "urls" => 0.2,
                _ => 0.1,
            };
            let sev_weight = match m.severity {
                0 => 0.0,
                1 => 2.0,
                2 => 5.0,
                3 => 20.0,
                4 => 100.0,
                _ => 0.0,
            };
            let likely_fp = m.rule_name.to_lowercase().contains("test")
                || m.description.to_lowercase().contains("test")
                || m.rule_name.to_lowercase().contains("example")
                || m.description.to_lowercase().contains("example")
                || m.rule_name.to_lowercase().contains("sample")
                || m.description.to_lowercase().contains("sample");
            let fp_weight = if likely_fp { 0.1 } else { 1.0 };
            score += cat_weight * sev_weight * fp_weight;
            max_severity = max_severity.max(m.severity);
            if ["obfuscation", "network", "reflection", "urls"].contains(&cat.as_str()) && m.severity >= 3 {
                suspicious = true;
            }
            if cat == "authentication" && m.severity >= 4 {
                auth_high += 1;
            }
            if cat == "file_paths" && m.severity >= 3 {
                filepath_high += 1;
            }
            if cat == "class_loading" && m.severity >= 3 {
                classload_high += 1;
            }
        }
    }
    if n > 10 {
        score *= 10.0 / n as f64;
    }
    if n == 0 {
        return ("Benign".to_string(), "None".to_string(), 0);
    }
    if (auth_high >= 2 && filepath_high >= 1) || (auth_high >= 1 && filepath_high >= 2) || (auth_high >= 1 && classload_high >= 1) || (filepath_high >= 1 && classload_high >= 1) {
        score = score.max(90.0);
        critical = true;
    }
    let mut _verdict = "Benign".to_string();
    let mut _severity = "None".to_string();
    let mut _mapped_score = score.round() as u8;
    if critical || score >= 90.0 {
        _verdict = "Malicious".to_string();
        _severity = "High".to_string();
        _mapped_score = _mapped_score.max(90).min(100);
    } else if suspicious || score >= 60.0 {
        _verdict = "Suspicious".to_string();
        _severity = "Medium".to_string();
        _mapped_score = _mapped_score.max(60).min(89);
    } else if score >= 20.0 {
        _verdict = "Undetected".to_string();
        _severity = "Low".to_string();
        _mapped_score = _mapped_score.max(20).min(59);
    } else {
        _verdict = "Benign".to_string();
        _severity = "None".to_string();
        _mapped_score = _mapped_score.min(19);
    }
    (_verdict, _severity, _mapped_score)
}

async fn handle_scan_request(state: &AppState, request: ScanRequest) -> ScanResponse {
    let mut hasher = Sha256::new();
    hasher.update(&request.data);
    let hash = format!("{:x}", hasher.finalize());

    println!("[+] processing new file with hash: {}", hash);

    if let Some(cached) = state.hash_cache.lock().unwrap().get(&hash) {
        println!("[+] found cached results for file with hash: {}", hash);
        return cached.clone();
    }

    println!("[+] starting scan of file with hash: {}", hash);
    let decoded_data = match STANDARD.decode(&request.data) {
        Ok(data) => data,
        Err(e) => {
            eprintln!("[-] failed to decode base64 data: {}", e);
            return ScanResponse {
                results: HashMap::new(),
                hash: hash.clone(),
                verdict: "Undetected".to_string(),
                severity: "None".to_string(),
                score: 0,
            };
        }
    };
    
    let mut scanner = match Scanner::new() {
        Ok(scanner) => scanner,
        Err(e) => {
            eprintln!("[-] failed to create scanner: {}", e);
            return ScanResponse {
                results: HashMap::new(),
                hash: hash.clone(),
                verdict: "Undetected".to_string(),
                severity: "None".to_string(),
                score: 0,
            };
        }
    };

    let results = match tokio::time::timeout(
        std::time::Duration::from_secs(30),
        tokio::task::spawn_blocking(move || {
            match scanner.scan_jar_in_memory(&decoded_data) {
                Ok(results) => Ok::<HashMap<String, Vec<Match>>, String>(results),
                Err(e) => {
                    eprintln!("[-] failed to scan file: {}", e);
                    Ok(HashMap::new())
                }
            }
        })
    ).await {
        Ok(Ok(Ok(results))) => results,
        Ok(Ok(Err(_))) => HashMap::new(),
        Ok(Err(e)) => {
            eprintln!("[-] task failed: {}", e);
            HashMap::new()
        },
        Err(_) => {
            eprintln!("[-] scan timed out after 30 seconds");
            HashMap::new()
        }
    };
    let filtered_results = filter_relevant_results(&results);
    let (verdict, severity, score) = calculate_verdict_severity_score(&filtered_results);
    let response = ScanResponse {
        results: filtered_results,
        hash: hash.clone(),
        verdict,
        severity,
        score,
    };

    state.hash_cache.lock().unwrap().insert(hash, response.clone());
    println!("[+] results cached and ready to send to client");

    response
}

async fn handle_websocket(ws: WebSocket, state: Arc<AppState>) {
    let (mut ws_sender, mut ws_receiver) = ws.split();

    while let Some(msg) = ws_receiver.next().await {
        if let Ok(msg) = msg {
            if msg.is_text() {
                let text = msg.to_str().unwrap();
                
                if let Ok(request) = serde_json::from_str::<ScanRequest>(text) {
                    let response = handle_scan_request(&state, request).await;
                    
                    if let Ok(response_json) = serde_json::to_string(&response) {
                        if let Err(_e) = ws_sender.send(Message::text(response_json)).await {}
                    } else {
                        if let Err(_e) = ws_sender.send(Message::text(r#"{"error":"Failed to serialize response"}"#)).await {}
                    }
                } else {
                    if let Err(_e) = ws_sender.send(Message::text(r#"{"error":"Invalid request format"}"#)).await {}
                }
            }
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let args = Args::parse();
    let state = Arc::new(AppState {
        hash_cache: Arc::new(Mutex::new(HashMap::new())),
    });

    let state = warp::any().map(move || state.clone());

    let health = warp::path!("health")
        .map(|| "OK");

    let ws = warp::path("ws")
        .and(warp::ws())
        .and(state)
        .map(|ws: warp::ws::Ws, state| {
            ws.on_upgrade(move |socket| handle_websocket(socket, state))
        });

    let routes = health.or(ws);

    let addr: std::net::SocketAddr = args.listen.parse()?;
    println!("[+] listening on {}", addr);
    warp::serve(routes).run(addr).await;

    Ok(())
}