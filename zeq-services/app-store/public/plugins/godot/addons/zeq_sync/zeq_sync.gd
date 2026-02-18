@tool
extends EditorPlugin

## ZEQ OS Sync Plugin for Godot
## Version: 0.4.0-beta
##
## Synchronizes Godot physics and nodes to the 1.287 Hz HulyaPulse.

const PLUGIN_NAME = "ZeqSync"

func _enter_tree():
	# Add the autoload singleton
	add_autoload_singleton("ZeqSync", "res://addons/zeq_sync/ko42.gd")
	print("[ZeqSync] Plugin enabled - 1.287 Hz HulyaPulse synchronization active")

func _exit_tree():
	# Remove the autoload singleton
	remove_autoload_singleton("ZeqSync")
	print("[ZeqSync] Plugin disabled")
