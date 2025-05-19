use std::error::Error;
use yara_x::{Scanner, Rules, Compiler};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YaraMatch {
    pub rule_name: String,
    pub category: String,
    pub severity: i32,
    pub description: String,
    pub details: String,
}

pub struct YaraScanner {
    rules: Rules,
}

impl YaraScanner {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let mut compiler = Compiler::new();
        
        compiler.add_source(include_str!("rules/authentication.yara"))?;
        compiler.add_source(include_str!("rules/file_paths.yara"))?;
        compiler.add_source(include_str!("rules/urls.yara"))?;
        compiler.add_source(include_str!("rules/executables.yara"))?;
        compiler.add_source(include_str!("rules/reflection.yara"))?;
        compiler.add_source(include_str!("rules/runtime.yara"))?;
        // compiler.add_source(include_str!("rules/network.yara"))?;
        // compiler.add_source(include_str!("rules/filesystem.yara"))?;
        compiler.add_source(include_str!("rules/cryptography.yara"))?;
        compiler.add_source(include_str!("rules/class_loading.yara"))?;
        // compiler.add_source(include_str!("rules/obfuscation.yara"))?;
        compiler.add_source(include_str!("rules/code_analysis.yara"))?;
        
        let rules = compiler.build();
        Ok(YaraScanner { rules })
    }

    pub fn scan_bytes(&self, data: &[u8]) -> Result<Vec<YaraMatch>, Box<dyn Error>> {
        // println!("[+] running yara scan on bytes");
        let mut scanner = Scanner::new(&self.rules);
        let result = scanner.scan(data)?;
        
        let mut results = Vec::new();
        for rule_match in result.matching_rules() {
            let rule_name = rule_match.identifier().to_string();
            
            let meta_map: HashMap<String, String> = rule_match.metadata()
                .map(|(k, v)| (k.to_string(), match v {
                    yara_x::MetaValue::String(s) => s.to_string(),
                    yara_x::MetaValue::Integer(i) => i.to_string(),
                    yara_x::MetaValue::Float(f) => f.to_string(),
                    yara_x::MetaValue::Bool(b) => b.to_string(),
                    yara_x::MetaValue::Bytes(b) => format!("{:?}", b),
                })) 
                .collect();
            
            let category = meta_map
                .get("category")
                .map(ToString::to_string)
                .unwrap_or_else(|| "unknown".to_string());
                
            let severity = meta_map
                .get("severity")
                .map(|s| {
                    if let Ok(severity_num) = s.parse::<i32>() {
                        severity_num
                    } else {
                        match s.to_lowercase().as_str() {
                            "info" => 0,
                            "low" => 1,
                            "medium" => 2,
                            "high" => 3,
                            "critical" => 4,
                            _ => 0
                        }
                    }
                })
                .unwrap_or(0);
                
            let description = meta_map
                .get("description")
                .map(ToString::to_string)
                .unwrap_or_else(|| "No description available".to_string());
                
            let details = meta_map
                .get("details")
                .map(ToString::to_string)
                .unwrap_or_else(|| "No details available".to_string());
            
            results.push(YaraMatch {
                rule_name,
                category,
                severity,
                description,
                details,
            });
        }
        
        // println!("[+] yara scan found {} matches", results.len());
        Ok(results)
    }    
}