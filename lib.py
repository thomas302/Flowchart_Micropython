def print_special(val):
    print(val)
    
def multi_input(val1, val2):
    print("val1: ", val1)
    print("val2: ", val2)
    return val1,val2
    
def init_output_pin(pin):
    output_pins[pin] = Pin(pin, Pin.OUT)

def init_input_pin(pin):
    output_pins[pin] = Pin(pin, Pin.IN)
    
def set_pin(pin, val):
    if pin not in output_pins:
        print("Pin number not initialized")
        return
    output_pins[pin].value(val)
    
def set_rgb(rgb):
    onboard_led[0] = rgb
    onboard_led.write()
    
set_rgb((0,255,0))