use std::env;
use std::fs;
use std::path::PathBuf;

pub fn get_temp_test_dir(test_name: &str) -> PathBuf {
    let mut test_dir = env::temp_dir();
    test_dir.push("zamm/tests");
    test_dir.push(test_name);
    if test_dir.exists() {
        fs::remove_dir_all(&test_dir).expect("Can't reset test preferences dir");
    }
    test_dir
}
