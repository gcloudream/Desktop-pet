use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    Manager, Window,
};

#[tauri::command]
fn set_ignore_cursor_events(window: Window, ignore: bool) -> Result<(), String> {
    window
        .set_ignore_cursor_events(ignore)
        .map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                // Resize to work area (excludes Dock on macOS, taskbar on Windows)
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let work_area = monitor.work_area();
                    let work_w = work_area.size.width;
                    let work_h = work_area.size.height;

                    // Use work area size to avoid Dock/taskbar overlap
                    let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                        width: work_w,
                        height: work_h,
                    }));
                    let _ = window.set_position(tauri::Position::Physical(
                        tauri::PhysicalPosition {
                            x: work_area.position.x,
                            y: work_area.position.y,
                        },
                    ));
                }
                // Start with click-through
                let _ = window.set_ignore_cursor_events(true);
            }

            // System tray
            let show_item = MenuItemBuilder::with_id("show", "👀 显示/隐藏小牛").build(app)?;
            let respawn_item = MenuItemBuilder::with_id("respawn", "🔄 重新召唤").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "❌ 退出").build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&show_item)
                .separator()
                .item(&respawn_item)
                .separator()
                .item(&quit_item)
                .build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let is_visible = window.is_visible().unwrap_or(false);
                            if is_visible {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                    "respawn" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.eval("window.__pet?.respawn()");
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_ignore_cursor_events])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
