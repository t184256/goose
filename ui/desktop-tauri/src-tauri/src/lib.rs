use std::sync::Arc;
use std::path::PathBuf;
use goose::agents::{Agent, AgentEvent, SessionConfig};
use goose::conversation::message::Message;
use goose::session::{SessionManager, SessionType, Session};
use goose::providers::create_with_named_model;
use goose::providers::databricks::DATABRICKS_DEFAULT_MODEL;
use futures::StreamExt;
use tauri::{Emitter, Manager, State};
use tokio::sync::Mutex;

// State to hold the Agent instance
pub struct AgentState {
    agent: Arc<Agent>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn create_session(
    working_dir: String,
    name: String,
    session_type: SessionType,
) -> Result<Session, String> {
    let working_dir = PathBuf::from(working_dir);
    
    SessionManager::create_session(working_dir, name, session_type)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn agent_reply(
    agent_state: State<'_, Mutex<AgentState>>,
    user_message: Message,
    session_config: SessionConfig,
    window: tauri::Window,
) -> Result<(), String> {
    let agent_state = agent_state.lock().await;
    let agent = &agent_state.agent;
    
    // Call the reply method
    let mut stream = agent
        .reply(user_message, session_config, None)
        .await
        .map_err(|e| e.to_string())?;
    
    // Stream events to the frontend
    while let Some(event) = stream.next().await {
        match event {
            Ok(event) => {
                // Convert AgentEvent to a serializable format
                let event_json = match event {
                    AgentEvent::Message(msg) => {
                        serde_json::json!({
                            "type": "message",
                            "message": msg
                        })
                    }
                    AgentEvent::McpNotification((id, notification)) => {
                        serde_json::json!({
                            "type": "mcp_notification",
                            "id": id,
                            "notification": notification
                        })
                    }
                    AgentEvent::ModelChange { model, mode } => {
                        serde_json::json!({
                            "type": "model_change",
                            "model": model,
                            "mode": mode
                        })
                    }
                    AgentEvent::HistoryReplaced(conversation) => {
                        serde_json::json!({
                            "type": "history_replaced",
                            "conversation": conversation
                        })
                    }
                };
                
                // Emit event to the frontend
                window.emit("agent-event", event_json).map_err(|e| e.to_string())?;
            }
            Err(e) => {
                // Emit error to the frontend
                window.emit("agent-error", e.to_string()).map_err(|e| e.to_string())?;
                return Err(e.to_string());
            }
        }
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize the provider and agent using Tauri's async runtime
            let agent = tauri::async_runtime::block_on(async {
                let provider = create_with_named_model("databricks", DATABRICKS_DEFAULT_MODEL)
                    .await
                    .expect("Couldn't create provider");

                let agent = Agent::new();
                agent.update_provider(provider).await
                    .expect("Couldn't update provider");
                
                agent
            });
            
            app.manage(Mutex::new(AgentState {
                agent: Arc::new(agent),
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, create_session, agent_reply])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
