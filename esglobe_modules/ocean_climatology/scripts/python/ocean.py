#!/usr/bin/python
import numpy as np
np.warnings.filterwarnings('ignore')
import logging, sys
import os, argparse

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
import netCDF4
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

parser.add_argument('--field',
                    action="store",
                    dest="field",
                    default="THETA",
                    help='')

parser.add_argument('--filename',
                    action="store",
                    help='Output filename',
                    dest="fn")
parser.add_argument('--contour',
                    type=str2bool, nargs='?',
                    const=True,
                    default=False,
                    help='plot contour')

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

parser.add_argument('--contour-step',
                    action="store",
                    dest="contour_step",
                    default="50",
                    help='Contour step')

parser.add_argument('--save-data',
                    type=str2bool, nargs='?',
                    dest="saveData",
                    const=True,
                    default=False,
                    help='write data to file')

args = parser.parse_args()

if args.contour:
  contour_step = float(args.contour_step)


fn='../../data/output/'+args.fn
months={"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11,"Movie":-1, "Year":-2}
t0=months[args.time]

if args.field == 'THETA':
  f=netCDF4.Dataset("../../data/THETA.0001.nc")
if args.field == 'EVELMASS':
  f=netCDF4.Dataset("../../data/EVELMASS.0001.nc")
if args.field == 'NVELMASS':
  f=netCDF4.Dataset("../../data/NVELMASS.0001.nc")
if args.field == 'oceTAUE':
    f=netCDF4.Dataset("../../data/oceTAUE.0001.nc")
if args.field == 'oceTAUN':
    f=netCDF4.Dataset("../../data/oceTAUN.0001.nc")

def colorbarFmt(x, pos):
  print "colorbar fmt"
  if args.field == 'oceTAUN' or args.field == 'oceTAUE':
    return "%.2f" % x
  else:
    return int(x)

def getTheta(field, month, depth):
  print "depth", depth
  if args.field == 'oceTAUE' or args.field == 'oceTAUN':
    return f[field][month, :, :]
  else:
    return f[field][month, depth,:,:]

lat=f["lat"][:]
lon=f["lon"][:]

def colorbar(CS):
  # save the color bar
  a = np.array([[0, 1]])
  plt.figure(figsize=(1,3))
  plt.imshow(a, cmap=plt.cm.jet)
  plt.gca().set_visible(False)
  cax = plt.axes([0.2, 0.1, 0.2, 0.8])

  if args.field != 'hgt':
    cb = plt.colorbar(CS, orientation='vertical', cax=cax, format = ticker.FuncFormatter(colorbarFmt))

    fg_color = 'white'
    # set colorbar tick color
    cb.ax.yaxis.set_tick_params(color=fg_color)

    # set colorbar edgecolor
    cb.outline.set_edgecolor(fg_color)
    # set colorbar ticklabels
    plt.setp(plt.getp(cb.ax.axes, 'yticklabels'), color=fg_color)

  plt.savefig(fn+'-colorbar.png', transparent = True)

def generatePlot(month):
  v=getTheta(args.field, month, args.depth)

  print "getTheta", v.shape
  fmt2='%0.0f'
  if args.field == 'THETA':
    [min, max, vcenter, vrange] = colorMap.thetaColorMap(args.depth)
  elif args.field == 'EVELMASS':
    [min, max, vcenter, vrange] = colorMap.evelmassColorMap(args.depth)
  elif args.field == 'NVELMASS':
    [min, max, vcenter, vrange] = colorMap.nvelmassColorMap(args.depth)
  elif args.field == 'oceTAUE':
    fmt2='%0.2f'
    [min, max, vcenter, vrange] = colorMap.oceTaueColorMap(args.depth)
  elif args.field == 'oceTAUN':
    fmt2='%0.2f'
    [min, max, vcenter, vrange] = colorMap.oceTaunColorMap(args.depth)

  cm = colorMap.customColorMap(vcenter, vrange, min, max)

  fig=plt.figure(figsize=(20.48,10.24))
  fig.clf()
  ax=fig.add_axes((0,0,1,1))
  ax.set_axis_off()

  if args.field == 'oceTAUE':
    CS = ax.contourf(lon,lat,v, np.arange(min, max, contour_step),cmap=cm)
    CS2 = ax.contour(lon,lat,v, np.arange(min, max, contour_step), colors='0.2')
  else:
    CS = ax.contourf(lon,lat,v, np.arange(min, max, contour_step),cmap=cm)
    CS2 = ax.contour(lon,lat,v, np.arange(min, max, contour_step), colors='0.2')

  ax.clabel(CS2, CS2.levels, inline=True, fmt=fmt2, fontsize=12)

  fig.savefig(fn+'-'+str(month)+'.png', transparent = True)
  colorbar(CS)


if t0 >= 0:
  generatePlot(t0)
else:
  nr = range(0, 12)
  for n in nr:
    print "Generating movie for month", n
    generatePlot(n)
