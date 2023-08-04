import os

def handler(event):
    height = os.environ['HEIGHT']
    width = os.environ['WIDTH']
    print(f'Resized to height of {height} and width of {width}')