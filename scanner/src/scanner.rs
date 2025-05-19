use std::io::{Read, Cursor};
use std::collections::{HashMap, HashSet};
use crate::yara::YaraScanner;
use std::error::Error;
use std::fmt;
use serde::{Serialize, Deserialize};
use zip::ZipArchive;
use sha2::{Sha256, Digest};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Match {
    pub file: String,
    pub rule_name: String,
    pub category: String,
    pub severity: i32,
    pub description: String,
    pub details: String,
    pub parent_jar: Option<String>,
}

impl fmt::Display for Match {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let severity_text = match self.severity {
            0 => "Info",
            1 => "Low",
            2 => "Medium",
            3 => "High",
            4 => "Critical",
            _ => "Unknown",
        };
        write!(f, "[{}] {} in {} - {}", severity_text, self.description, self.file, self.details)
    }
}

pub struct Scanner {
    yara_scanner: YaraScanner,
}

impl Scanner {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let yara_scanner = YaraScanner::new()?;
        Ok(Scanner { yara_scanner })
    }

    pub fn scan_jar_in_memory(&mut self, jar_data: &[u8]) -> Result<HashMap<String, Vec<Match>>, Box<dyn Error>> {
        let mut matches = HashMap::new();
        let mut jar_stack: Vec<(Vec<u8>, Option<String>)> = Vec::new();
        let mut processed_hashes = HashSet::new();
        
        let mut hasher = Sha256::new();
        hasher.update(jar_data);
        
        jar_stack.push((jar_data.to_vec(), None));
        
        while let Some((current_jar_data, parent_jar)) = jar_stack.pop() {
            let mut hasher = Sha256::new();
            hasher.update(&current_jar_data);
            let jar_hash = format!("{:x}", hasher.finalize());
            
            if processed_hashes.contains(&jar_hash) {
                continue;
            }
            processed_hashes.insert(jar_hash.clone());
            
            println!("[+] scanning JAR with hash: {}", jar_hash);
            
            if let Ok(yara_matches) = self.yara_scanner.scan_bytes(&current_jar_data) {
                for yara_match in yara_matches {
                    if yara_match.category == "executables" {
                        continue;
                    }
                    let category_matches = matches.entry(yara_match.category.clone()).or_insert_with(Vec::new);
                    category_matches.push(Match {
                        file: format!("jar_{}.jar", jar_hash),
                        rule_name: yara_match.rule_name,
                        category: yara_match.category,
                        severity: yara_match.severity,
                        description: yara_match.description,
                        details: yara_match.details,
                        parent_jar: parent_jar.clone(),
                    });
                }
            }
            
            let cursor = Cursor::new(current_jar_data);
            let mut archive = match ZipArchive::new(cursor) {
                Ok(archive) => archive,
                Err(e) => {
                    eprintln!("[-] warning: failed to read JAR as a zip archive: {}", e);
                    continue;
                }
            };
            
            for i in 0..archive.len() {
                let mut file = match archive.by_index(i) {
                    Ok(file) => file,
                    Err(e) => {
                        eprintln!("[-] warning: failed to read file {} in JAR: {}", i, e);
                        continue;
                    }
                };
                
                let name = file.name().to_string();
                
                if name.ends_with(".class") {
                    let mut content = Vec::new();
                    if let Err(e) = file.read_to_end(&mut content) {
                        eprintln!("[-] warning: failed to read content of {}: {}", name, e);
                        continue;
                    }
                    
                    if let Ok(yara_matches) = self.yara_scanner.scan_bytes(&content) {
                        for yara_match in yara_matches {
                            if yara_match.category == "executables" {
                                continue;
                            }
                            let category_matches = matches.entry(yara_match.category.clone()).or_insert_with(Vec::new);
                            category_matches.push(Match {
                                file: name.clone(),
                                rule_name: yara_match.rule_name,
                                category: yara_match.category,
                                severity: yara_match.severity,
                                description: yara_match.description,
                                details: yara_match.details,
                                parent_jar: Some(format!("jar_{}.jar", jar_hash)),
                            });
                        }
                    }
                } else if name.ends_with(".jar") {
                    let mut content = Vec::new();
                    if let Err(e) = file.read_to_end(&mut content) {
                        eprintln!("[-] warning: failed to read nested jar {}: {}", name, e);
                        continue;
                    }
                    
                    jar_stack.push((content, Some(format!("jar_{}.jar", jar_hash))));
                }
            }
        }
        
        Ok(matches)
    }
} 