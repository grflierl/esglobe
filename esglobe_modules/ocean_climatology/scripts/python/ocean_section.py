#!/usr/bin/python
import numpy as np
np.warnings.filterwarnings('ignore')
import logging, sys
import os, argparse

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
import netCDF4
import math
import matplotlib
import matplotlib.ticker as ticker
matplotlib.use('Agg')
from matplotlib import pyplot as plt

import colorMap

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

def str2bool(v):
  if v.lower() in ('yes', 'true', 't', 'y', '1'):
    return True
  elif v.lower() in ('no', 'false', 'f', 'n', '0'):
    return False
  else:
    raise argparse.ArgumentTypeError('Boolean value expected.')

parser = argparse.ArgumentParser(description='ShowClim image generator')
parser.add_argument('--time',
                    action="store",
                    dest="time",
                    default="Jan",
                    help='Month (Jan-Dec), or year for movie')

parser.add_argument('--depth',
                    action="store",
                    dest="depth",
                    default="1000",
                    help='Depth (e.g. 1000)')

parser.add_argument('--depth-region',
                    action="store",
                    dest="depthRegion",
                    default="FULL",
                    help='FULL, THERMOCLINE, ABYSS')

parser.add_argument('--lon',
                    action="store",
                    dest="lon",
                    type=int,
                    default=0)

parser.add_argument('--field',
                    action="store",
                    dest="field",
                    default="THETA",
                    help='')

parser.add_argument('--filename',
                    action="store",
                    help='Output filename',
                    dest="fn")

parser.add_argument('--min',
                    action="store",
                    dest="min",
                    default="-50",
                    help='Min Value')

parser.add_argument('--max',
                    action="store",
                    dest="max",
                    default="50",
                    help='Max Value')

parser.add_argument('--zonal-average',
                    type=str2bool, nargs='?',
                    dest="zonalaverage",
                    const=True,
                    default=False,
                    help='returns the zonal average')

parser.add_argument('--logscale',
                    type=str2bool, nargs='?',
                    const=True,
                    default=True,
                    help='log scale on y-axis')

parser.add_argument('--save-data',
                    type=str2bool, nargs='?',
                    dest="saveData",
                    const=True,
                    default=False)

parser.add_argument('--contour',
                    action="store",
                    type=float,
                    dest="contour",
                    default="50",
                    help='Contour step')

args = parser.parse_args()


fn='../../data/output/'+args.fn
months={"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11, "Year":-1}
t0=months[args.time]

yearAverage = False
if t0 == -1:
  yearAverage = True
  t0 = 0

def read_nc(month):
  if args.field == 'THETA':
    nc0=netCDF4.Dataset("../../data/THETA.0001.nc")
  if args.field == 'EVELMASS':
    nc0=netCDF4.Dataset("../../data/EVELMASS.0001.nc")
  if args.field == 'NVELMASS':
    nc0=netCDF4.Dataset("../../data/NVELMASS.0001.nc")

  nc=nc0
  lat=nc['lat'][:]
  lon=nc['lon'][0, :]
  depth=nc['dep'][:]
  theta=getTheta(args.field, month, nc)
  return [lat, lon, depth, theta]

def getTheta(field, month, f):
  th = f[field][month, :,:,:]
  return th

def generatePlot(month):

  matplotlib.rc('xtick', labelsize=18)
  matplotlib.rc('ytick', labelsize=18)

  fig = plt.figure(figsize=(12, 10))
  ax = fig.add_subplot(1,1,1)

  plt.gca().invert_yaxis()

  [lat1, lon1, depth1, theta] = read_nc(month)

  # get depth region
  depthRegion = depth1
  depthInd = np.where(depth1 < 99999)

  if args.depthRegion == 'THERMOCLINE':
    depthInd = np.where(depth1 < 1000)
    depthRegion = depth1[depthInd]
  if args.depthRegion == 'ABYSS':
    depthInd = np.where(depth1 >= 1000)
    depthRegion = depth1[depthInd]

  latr=[-90,90]
  lat1 = np.asarray(lat1[:, 0])
  latind = np.where((lat1 <= latr[1]) & (lat1 >= latr[0]))

  lon2 = np.where(lon1 > args.lon)
  lonind = lon2[0][0]

  theta = get_section_th(theta, lonind, depthInd)


  # argument min/max overrides
  if args.min:
    min_arg = float(args.min)
  else:
    min_arg = math.floor(th.min())

  if args.max:
    max = float(args.max)
  else:
    max = math.ceil(th.max())

  contour = args.contour


  if args.logscale:
    ax1 = plt.axes()
    ax1.set_yscale('log')
    ax1 = plt.axes()

    if args.depthRegion == 'THERMOCLINE':
      ax1.set_yticks([0, 50, 100, 200, 300, 400, 500, 1000])
    if args.depthRegion == 'ABYSS':
      ax1.set_yticks([1000, 2000, 3000, 4000, 5000])
    else:
      ax1.set_yticks([0, 50, 100, 200, 300, 400, 500, 1000, 2000, 4000, 5000])

    ax1.get_yaxis().set_major_formatter(matplotlib.ticker.ScalarFormatter())
    # https://stackoverflow.com/questions/46498157/overlapping-axis-tick-labels-in-logarithmic-plots/46498658#46498658
    ax1.minorticks_off()

  if args.field == 'THETA':
    [min_arg, max, vcenter, vrange] = colorMap.thetaColorMap(0)
  elif args.field == 'EVELMASS':
    [min_arg, max, vcenter, vrange] = colorMap.evelmassColorMap(0)
  elif args.field == 'NVELMASS':
    [min_arg, max, vcenter, vrange] = colorMap.nvelmassColorMap(0)

  cm = colorMap.customColorMap(vcenter, vrange, min_arg, max)

  CS = plt.contourf(lat1, depthRegion, theta, np.arange(min_arg, max, contour), cmap=cm)
  CS2 = plt.contour(lat1, depthRegion, theta, np.arange(min_arg,max, contour), colors='k')

  fmt2 = "%0.0f"

  if args.field == 'EVELMASS':
    fmt2="%0.2f"
  if args.field == 'NVELMASS':
    fmt2="%0.2f"

  plt.clabel(CS2, CS2.levels[::2], inline=True, fmt=fmt2, fontsize=14)

  title = getTitle()
  plt.title(title, fontsize=16)
  axis_font = {'fontname':'Arial', 'size':'20'}
  plt.xlabel("Latitude", **axis_font)
  plt.ylabel("Depth (m)", **axis_font)

  fig.savefig(fn+'-'+str(month)+'.png', bbox_inches='tight', transparent = True)


def getTitle():
  titles = {
    "THETA": "Potential Temperature (C)",
    "EVELMASS": "u' Velocity",
    "NVELMASS": "v' Velocity"
  }

  fieldTitle = titles[args.field]
  lon = args.lon

  return fieldTitle + ' at lon ' + str(lon)

def get_section_th(theta, lonind, depthInd):
  th = np.squeeze(theta[depthInd,:, lonind])
  return th

if t0 >= 0:
  generatePlot(t0)
else:
  nr = range(0, 12)
  for n in nr:
    print "Generating movie for month", n
    generatePlot(n)
