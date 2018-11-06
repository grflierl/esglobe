#!/usr/bin/python
import numpy as np
import logging, sys
import zipfile, re
import os, argparse

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
from scipy.io.netcdf import netcdf_file
from netCDF4 import Dataset
import json


abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

parser = argparse.ArgumentParser(description='ShowClim image generator')
def str2bool(v):
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

parser.add_argument('--minpress',
                    action="store",
                    dest="minpress",
                    type=int,
                    default=200)
parser.add_argument('--lon',
                    action="store",
                    dest="lon",
                    type=int,
                    default=0)
parser.add_argument('--month',
                    action="store",
                    dest="month_str",
                    default="Jan",
                    help='Month')
parser.add_argument('--field',
                    action="store",
                    dest="field",
                    default="pottmp",
                    help='pottmp, hgt, uwnd, vwnd, omega')
parser.add_argument('--field2',
                    action="store",
                    dest="field2",
                    default="none",
                    help='pottmp, hgt, uwnd, vwnd, omega')
parser.add_argument('--contour',
                    action="store",
                    dest="contour",
                    default=5,
                    type=float,
                    help='Contour density')
parser.add_argument('--contour2',
                    action="store",
                    dest="contour2",
                    default=5,
                    type=float,
                    help='Contour density')
parser.add_argument('--filename',
                    action="store",
                    help='Output filename',
                    dest="fn")

parser.add_argument('--logscale',
                    type=str2bool, nargs='?',
                    const=True,
                    default=True,
                    help='log scale on y-axis')

parser.add_argument('--fill-contour',
                    type=str2bool, nargs='?',
                    dest="fillcontour",
                    const=True,
                    default=False,
                    help='draws a fill contour')

parser.add_argument('--save-data',
                    type=str2bool, nargs='?',
                    dest="saveData",
                    const=True,
                    default=False,
                    help='draws a fill contour')

parser.add_argument('--zonal-average',
                    type=str2bool, nargs='?',
                    dest="zonalaverage",
                    const=True,
                    default=False,
                    help='returns the zonal average')

parser.add_argument('--min',
                    action="store",
                    dest="min",
                    help="min data range")

parser.add_argument('--max',
                    action="store",
                    dest="max",
                    help="max data range")

parser.add_argument('--min2',
                    action="store",
                    dest="min2",
                    help="min2 data range")

parser.add_argument('--max2',
                    action="store",
                    dest="max2",
                    help="max2 data range")

parser.add_argument('--section-region',
                    action="store",
                    dest="sectionRegion",
                    help="section region (southern, northern, lon)")

args = parser.parse_args()
# typ1="uwnd"; % second set

fn='../../data/output/' + args.fn

months={"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11,"Year":-1, "Movie":-2 }
months_arr=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

mon=months[args.month_str]
yearAverage = False
movie = False

if mon == -1:
    yearAverage = True
    mon = 0

if mon == -2:
    movie = True

titles = {
    "pottmp": "Potential Temperature (K)",
    "omega": "Omega",
    "hgt":"Geopotential Height",
    "uwnd":"UWND",
    "vwnd":"VWND",
    "air": "Air Temperature (C)",
    "shum": "Specific Humidity",
    "rhum": "Relative Humidity",
    "wspd": "Wind Speed"
}

fieldTitle = titles[args.field]

if args.field2 != 'none':
    field2Title = titles[args.field2]

def read_nc(type):
    nc0=Dataset('../../data/ESRL-'+type+'.mon.1981-2010.ltm.nc')
    nc=nc0.variables
    lat=nc['lat'][:]
    lon=nc['lon'][:]
    level=nc['level'][:]
    yrday=nc['time'][:]
    theta=nc[type][:,:,:,:]

    nc0.close()
    return [lat, lon, level, theta]

[lat1, lon1, level1, theta] = read_nc(args.field)
if args.field2 != 'none':
    [lat2, lon2, level2, theta2] = read_nc(args.field2)


latr=[-90,90]
lat1 = np.asarray(lat1)


latind = np.where((lat1 <= latr[1]) & (lat1 >= latr[0]))

lon0 = args.lon+360*(args.lon<0)
print "input lon", args.lon
print "000: lon0", lon0


lon2 = abs(lon1-lon0)
lv = min(lon2)
print "=== lon2 ====", lon2, lv

lonind = lon2.tolist().index(lv)

print "001: lonind", lonind
print "002: final value", lon1[lonind]

level1 = np.asarray(level1)

# if minpress is 1, that's the upper stratosphere
if args.minpress == 1:
    vind = np.where(level1 <= 100)
else:
    vind = np.where(level1 >= args.minpress)

if args.field == 'rhum' or args.field == 'shum' or args.field2 == 'rhum' or args.field2 == 'shum':
    vind = np.where(level1 >= 300)

# color bar formatter
def colorbarFmt(x, pos):
  if args.field == 'omega' or args.field == 'vwnd':
    return "%.2f" % x;
  elif args.field == 'vwnd':
    return "%.1f" % x;
  else:
    return int(x)

def get_section_image(month, suffix):

  if suffix:
    filename = fn + '-' + str(n) + '.png'
  else:
    filename = fn + '.png'

  if os.path.isfile(filename):
    return filename

  th = get_th(theta, month)
  if args.field2 != 'none':
    th2 = get_th(theta2, month)

  lev = level1[vind]

  import matplotlib
  import math
  matplotlib.use('Agg')
  from matplotlib import cm
  import matplotlib.pyplot as plt
  from matplotlib.ticker import ScalarFormatter
  import matplotlib.ticker as ticker
  import colorMap

  matplotlib.rc('xtick', labelsize=18)
  matplotlib.rc('ytick', labelsize=18)

  fig = plt.figure(figsize=(12, 10))
  ax = fig.add_subplot(1,1,1)

  # argument min/max overrides
  if args.min:
    min = float(args.min)
  else:
    min = math.floor(th.min())

  if args.max:
    max = float(args.max)
  else:
    max = math.ceil(th.max())

  contour = args.contour

  if args.field2 != 'none':
    # argument min/max overrides
    if args.min2:
      min2 = float(args.min2)
    else:
      min2 = math.floor(th2.min())

    if args.max2:
      max2 = float(args.max2)
    else:
      max2 = math.ceil(th2.max())
    contour2 = args.contour2

  # print (max, min, contour)
  if args.fillcontour:
    cm = plt.cm.jet

    if args.field == 'pottmp':
      [min, max, vcenter, vrange] = colorMap.pottmpColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == 'air':
      [min, max, vcenter, vrange] = colorMap.airColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == 'shum':
      [min, max, vcenter, vrange] = colorMap.shumColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == 'rhum':
      [min, max, vcenter, vrange] = colorMap.rhumColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == 'wspd':
      [min, max, vcenter, vrange] = colorMap.wspdColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == 'uwnd':
      [min, max, vcenter, vrange] = colorMap.uwndColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == 'vwnd':
      [min, max, vcenter, vrange] = colorMap.vwndColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == 'omega':
      [min, max, vcenter, vrange] = colorMap.omegaColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == 'hgt':
      [min, max, vcenter, vrange] = colorMap.heightColorMap(args.minpress)
      cm = colorMap.customColorMap(vcenter, vrange, min, max)

    if args.field == args.field2:
      min2 = min
      max2 = max


    CS = plt.contourf(lat1[latind], lev, th, np.arange(min, max, contour), cmap=cm)

    if args.field2 and args.field2 != args.field:
      b = plt.colorbar(CS, orientation='vertical', format = ticker.FuncFormatter(colorbarFmt), pad=0.02)
  else:
    CS = plt.contour(lat1[latind], lev, th, np.arange(min, max, contour))
    fmt1 = "%0.0f"
    if args.field == 'vwnd':
      fmt1="%0.1f"
    if args.field == 'omega':
      fmt1="%0.3f"
    plt.clabel(CS, CS.levels[::2], inline=True, fmt=fmt1, fontsize=14)

  plt.gca().invert_yaxis()

  # print (th)

  if args.field2 != 'none':
    CS2 = plt.contour(lat2[latind], lev, th2, np.arange(min2,max2, contour2), colors='k')
    fmt2 = "%0.0f"
    if args.field2 == 'vwnd':
      fmt2="%0.1f"
    if args.field2 == 'omega':
      fmt2="%0.3f"
    plt.clabel(CS2, CS2.levels[::2], inline=True, fmt=fmt2, fontsize=14)

  if args.field2 != 'none' and args.field2 != args.field:
    if args.zonalaverage:
      finalTitle = fieldTitle + ' and ' + field2Title +' (Zonal)';
    else:
      finalTitle = fieldTitle + ' and ' + field2Title +' at lon ' + str(args.lon)
  else:
    if args.zonalaverage:
      finalTitle = fieldTitle + ' (Zonal) '
    else:
      finalTitle = fieldTitle + ' at lon ' + str(args.lon)
      #plt.title(fieldTitle + ' at lon ' + str(args.lon), fontsize=20, y=1.04)

  finalTitle = finalTitle + ' / ' + months_arr[month]

  plt.title(finalTitle, fontsize=16)

  axis_font = {'fontname':'Arial', 'size':'20'}
  plt.xlabel("Latitude", **axis_font)
  plt.ylabel("Pressure", **axis_font)

  if args.logscale:
    ax1 = plt.axes()
    ax1.set_yscale('log')
    if args.field == 'rhum' or args.field == 'shum' or args.field2 == 'rhum' or args.field2 =='shum':
      ax1 = plt.axes()
      ax1.set_yticks([300, 400, 500, 600, 700, 800, 900, 1000])
    elif args.minpress == 100:
      ax1.set_yticks([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000])
    elif args.minpress == 10:
      ax1.set_yticks([10, 100, 200, 300, 400, 500])
    elif args.minpress == 1:
      ax1.set_yticks([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    elif args.minpress == 500:
      ax1.set_yticks([500, 600, 700, 800, 900, 1000])

    ax1.get_yaxis().set_major_formatter(matplotlib.ticker.ScalarFormatter())
    # https://stackoverflow.com/questions/46498157/overlapping-axis-tick-labels-in-logarithmic-plots/46498658#46498658
    ax1.minorticks_off()

  plt.savefig(filename, bbox_inches='tight', transparent = True)

  if args.saveData:
    writeData()

  return filename

def get_th(theta, mon):
    th = np.squeeze(theta[mon,vind,:,lonind])
    if args.zonalaverage:
        #calculate the zonal average
        if yearAverage:
            th = np.squeeze(theta[:, vind, :, :])
            th = np.average(th, axis=3) # axis 3 is longitudes
            th = np.average(th, axis=0) # axis 0 is month
        else:
            th = np.squeeze(theta[mon, vind, :, :])
            th = np.average(th, axis=2)
    else:
        if yearAverage:
            th = np.squeeze(theta[:, vind, :, lonind])
            th = np.average(th, axis=1) # axis 1 is month
        else:
            th = np.squeeze(theta[mon, vind, :, lonind])

    return th

if mon != -2:
  print get_section_image(mon, False)
else: # It's a movie, so loop through all months
  nr=range(0,12)
  for n in nr:
    print "getting", n
    print get_section_image(n, True)

print (json.dumps({
  'status': 'OK'
}))


def purge(dir, pattern):
  for f in os.listdir(dir):
    if re.search(pattern, f):
      print "purge MATCH", f
      os.remove(os.path.join(dir, f))

def writeData():
  #save the csv
  np.savetxt(fn + '.lat.csv', lat1[latind], delimiter=',')
  np.savetxt(fn + '.levels.csv', lev, delimiter=',')
  np.savetxt(fn + '.data.csv', th, delimiter=',')

  output_zip = zipfile.ZipFile(fn+'.zip', 'w')
  output_zip.write(fn + '.lat.csv', compress_type=zipfile.ZIP_DEFLATED)
  output_zip.write(fn + '.levels.csv', compress_type=zipfile.ZIP_DEFLATED)
  output_zip.write(fn + '.data.csv', compress_type=zipfile.ZIP_DEFLATED)
  output_zip.close()

  purge('../../data/output/', args.fn + '(.+)(.csv)')



