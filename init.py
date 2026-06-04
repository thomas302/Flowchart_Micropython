import time
from machine import Pin
import neopixel

#pin def
o_pins = [21]

pins = {}
for pin in o_pins:
    pins[pin] = Pin(pin, Pin.OUT)

i_pins = []
for pin in i_pins:
    pins[pin] = Pin(pin, Pin.OUT)
    
LED_PIN = 48 
# Initialize 1 onboard NeoPixel LED
onboard_led = neopixel.NeoPixel(Pin(LED_PIN), 1)
