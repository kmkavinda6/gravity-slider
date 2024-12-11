import eel
import argparse
from pythonosc import udp_client
import os

# Initialize eel with your web files directory
eel.init('web')

# Create OSC client
osc_client = udp_client.SimpleUDPClient("127.0.0.1", 8000)  # Default Unreal OSC port

# Function to send OSC messages to Unreal
@eel.expose
def update_gravity(value):
    # Convert slider value (0-100) to gravity scale (0-1)
    gravity_scale = float(value) / 100
    # Send OSC message to Unreal
    osc_client.send_message("/gravity/scale", gravity_scale)
    return f"Gravity set to {gravity_scale}"

# Start the application
if __name__ == '__main__':
    # Create web directory if it doesn't exist
    if not os.path.exists('web'):
        os.makedirs('web')
    
    eel.start('index.html', size=(800, 600))