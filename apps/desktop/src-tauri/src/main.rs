// AtlasERP Desktop â€” Tauri entry point (Rust)
// Previene la ventana de consola en Windows en release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    atlaserp_desktop_lib::run();
}

