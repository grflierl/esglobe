import sys
import argparse
import json

parser = argparse.ArgumentParser(description='ShowClim image generator')
parser.add_argument('--firstName',
                    action="store",
                    dest="firstName",
                    default="John")

parser.add_argument('--lastName',
                    action="store",
                    dest="lastName",
                    default="Doe")

args, unknown = parser.parse_known_args()
print(json.dumps({
  'message': 'Hello, ' + args.firstName + ' ' + args.lastName +', I am showing your map!',
  'image': 'mp.png'
}));