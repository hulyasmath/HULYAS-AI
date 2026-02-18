extends Node

## ZEQ OS KO42 Synchronization for Godot
## 
## Access via the ZeqSync autoload:
##   var sync_value = ZeqSync.get_sync_value()
##   var zeqond = ZeqSync.get_zeqond()

## Universal HulyaPulse frequency in Hz
const HULYAPULSE_HZ: float = 1.287

## One Zeqond in seconds (~0.777s)
const ZEQOND: float = 1.0 / HULYAPULSE_HZ

## One Zeqond in milliseconds (~777ms)
const ZEQOND_MS: float = ZEQOND * 1000.0

## SDK Version
const VERSION: String = "0.4.0-beta"

## Seconds since Big Bang (approximate)
const BIG_BANG_SECONDS: float = 4.35086e17

## Sync amplitude
@export var amplitude: float = 0.1

## Enable physics synchronization
@export var sync_physics: bool = true

## Gravity modulation strength
@export_range(0.0, 1.0) var gravity_modulation: float = 0.1

## Emitted every frame with pulse data
signal on_pulse(data: Dictionary)

## Emitted when a Zeqond boundary is crossed
signal on_zeqond_tick(pulse_count: int)

# Internal state
var _start_time: float = 0.0
var _last_zeqond: int = 0
var _pulse_count: int = 0
var _current_sync_value: float = 0.0
var _current_zeqond: float = 0.0
var _is_running: bool = true
var _base_gravity: Vector2

func _ready():
	_start_time = Time.get_ticks_msec() / 1000.0
	
	# Store base gravity for 2D
	_base_gravity = ProjectSettings.get_setting("physics/2d/default_gravity_vector", Vector2(0, 980))
	
	print("[ZeqSync] Initialized v%s | Frequency: %.3f Hz | Zeqond: %.3fs" % [VERSION, HULYAPULSE_HZ, ZEQOND])

func _process(delta: float):
	if not _is_running:
		return
	
	var elapsed = Time.get_ticks_msec() / 1000.0 - _start_time
	
	# Calculate KO42 sync value
	_current_sync_value = ko42(elapsed, amplitude)
	
	# Calculate current Zeqond
	_current_zeqond = get_current_zeqond()
	
	# Check for Zeqond boundary crossing
	var current_zeqond_int = int(elapsed * HULYAPULSE_HZ)
	if current_zeqond_int > _last_zeqond:
		_last_zeqond = current_zeqond_int
		_pulse_count += 1
		on_zeqond_tick.emit(_pulse_count)
	
	# Create pulse data
	var pulse_data = {
		"delta": delta,
		"zeqond": _current_zeqond,
		"sync_value": _current_sync_value,
		"pulse_count": _pulse_count,
		"elapsed_time": elapsed
	}
	
	# Fire pulse signal
	on_pulse.emit(pulse_data)
	
	# Modulate physics if enabled
	if sync_physics:
		_modulate_physics()

## KO42 Universal Synchronization Operator
## @param t: Time in seconds
## @param amp: Amplitude (default: 0.1)
## @param phase: Phase offset in radians (default: 0)
## @return: Sync value between [-amplitude, amplitude]
static func ko42(t: float, amp: float = 0.1, phase: float = 0.0) -> float:
	return amp * sin(2.0 * PI * HULYAPULSE_HZ * t + phase)

## KO42.1 Automatic Metric Tensioner
## @return: Dictionary with "value" and "pulse_term"
static func ko42_1(t: float, metric_term: float = 1.0, alpha: float = 0.00129) -> Dictionary:
	var pulse_term = alpha * sin(2.0 * PI * HULYAPULSE_HZ * t)
	return {
		"value": metric_term + pulse_term,
		"pulse_term": pulse_term
	}

## KO42.2 Manual Metric Tensioner
## @return: Dictionary with "value" and "pulse_term"
static func ko42_2(t: float, metric_term: float = 1.0, beta: float = 3.718) -> Dictionary:
	var pulse_term = beta * sin(2.0 * PI * HULYAPULSE_HZ * t)
	return {
		"value": metric_term + pulse_term,
		"pulse_term": pulse_term
	}

## Get current Zeqond (since Unix epoch)
static func get_current_zeqond() -> float:
	var unix_time = Time.get_unix_time_from_system()
	return unix_time / ZEQOND

## Get Zeqond since Big Bang
static func get_zeqond_from_big_bang() -> float:
	var unix_time = Time.get_unix_time_from_system()
	return (BIG_BANG_SECONDS + unix_time) / ZEQOND

## Convert seconds to Zeqonds
static func seconds_to_zeqonds(seconds: float) -> float:
	return seconds / ZEQOND

## Convert Zeqonds to seconds
static func zeqonds_to_seconds(zeqonds: float) -> float:
	return zeqonds * ZEQOND

## Get current sync value
func get_sync_value() -> float:
	return _current_sync_value

## Get current Zeqond
func get_zeqond() -> float:
	return _current_zeqond

## Start synchronization
func start_sync():
	_is_running = true
	_start_time = Time.get_ticks_msec() / 1000.0
	print("[ZeqSync] Synchronization started")

## Stop synchronization
func stop_sync():
	_is_running = false
	# Restore gravity
	if sync_physics:
		PhysicsServer2D.area_set_param(
			get_viewport().find_world_2d().space,
			PhysicsServer2D.AREA_PARAM_GRAVITY_VECTOR,
			_base_gravity
		)
	print("[ZeqSync] Synchronization stopped")

## Reset synchronization timer
func reset_sync():
	_start_time = Time.get_ticks_msec() / 1000.0
	_last_zeqond = 0
	_pulse_count = 0
	print("[ZeqSync] Synchronization reset")

func _modulate_physics():
	# Modulate 2D gravity with HulyaPulse
	var modulated_gravity = _base_gravity * (1.0 + _current_sync_value * gravity_modulation)
	PhysicsServer2D.area_set_param(
		get_viewport().find_world_2d().space,
		PhysicsServer2D.AREA_PARAM_GRAVITY_VECTOR,
		modulated_gravity
	)
