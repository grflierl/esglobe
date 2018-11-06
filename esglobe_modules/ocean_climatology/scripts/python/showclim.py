#!/usr/bin/python
import numpy as np
import os, re
import zipfile
from scipy.io.netcdf import netcdf_file
from netCDF4 import Dataset
import argparse

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
parser.add_argument('--press',
                    action="store",
                    dest="press",
                    default="1000",
                    help='Pressure (e.g. 1000)')
parser.add_argument('--field',
                    action="store",
                    dest="field",
                    default="pottmp",
                    help='pottmp, hgt, uwnd, vwnd, omega, air')
parser.add_argument('--filename',
                    action="store",
                    help='Output filename',
                    dest="fn")
parser.add_argument('--contour',
                    type=str2bool, nargs='?',
                    const=True,
                    default=False,
                    help='plot contour')

parser.add_argument('--save-data',
                    type=str2bool, nargs='?',
                    dest="saveData",
                    const=True,
                    default=False,
                    help='write data to file')


parser.add_argument('--contour-step',
                    action="store",
                    dest="contour_step",
                    default=10,
                    help='contour line step')
parser.add_argument('--press-range',
                    action="store",
                    dest="press_range",
                    default=100,
                    help='pressure range, defines the colormap')
parser.add_argument('--min',
                    action="store",
                    dest="min",
                    help="min data range")
parser.add_argument('--max',
                    action="store",
                    dest="max",
                    help="max data range")

args = parser.parse_args()
execfile("map.py")

nc0=Dataset('../../data/EVELMASS.0001.nc')
nc=nc0.variables
lat=nc['lat'][:]
lon=nc['lon'][:]
# roll and duplicate
ind=(lon>=180)
lon1=np.roll(lon-360*ind,72)
lon=np.append(lon1,180)
level=nc['dep'][:]
yrday=nc['tim'][:]
theta=nc['EVELMASS'][11,0,:,:]

if args.contour:
    args.contour_step = float(args.contour_step)

fn='../../data/output/'+args.fn
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import math, json
import matplotlib.ticker as ticker


def getTheta(theta, n, lev):
    if yearAverage:
        theta1 = theta[:, lev, :, :]
        theta1 = np.average(theta1, axis=0)
    else:
        theta1 = theta[n,lev,:,:]

    th1=np.roll(theta1,72,axis=1)
    th=np.hstack((th1,th1[:,0:1]))
    return th

# color bar formatter
def colorbarFmt(x, pos):
    if args.field == 'omega' or args.field == 'vwnd':
        return "%.2f" % x;
    elif args.field == 'vwnd':
        return "%.1f" % x;
    else:
        return int(x)

def splotit(th, overrideMin=False, overrideMax=False):
  #  plt.figure(1,figsize=[8.125*3.253/2,6.125*3.253/2])
  fig=plt.figure(figsize=(20.48,10.24))
  ax=fig.add_axes((0,0,1,1))
  ax.set_axis_off()
  cm = plt.cm.jet

  if args.contour:
    min = math.floor(th.min())
    max = math.floor(th.max())
    contour = args.contour_step
    if overrideMin:
      min = overrideMin
    if overrideMax:
      max = overrideMax

    if args.field != 'hgt':
        CS = ax.contourf(lon,lat,th, np.arange(min, max, contour), cmap=cm)

    CS2 = ax.contour(lon,lat,th, np.arange(min, max, contour), colors='0.2')
    ax.clabel(CS2, CS2.levels, inline=True, fmt="%0.0f", fontsize=12)
  else:
    ax.pcolormesh(lon,lat,th)

  lonx=[]
  latx=[]
  for i in range(0,len(lonm)):
    if lonm[i]<-180:
      ax.plot(lonx,latx,"#000000")
      lonx=[];
      latx=[];
    else:
      lonx.append(lonm[i])
      latx.append(latm[i])

  ax.plot(lonx,latx,"#000000")
  ax.axis('tight')

  plt.savefig(fn+'-'+str(n)+'.png')

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

  if args.saveData:
    writeData()


def purge(dir, pattern):
  for f in os.listdir(dir):
    if re.search(pattern, f):
      os.remove(os.path.join(dir, f))

def writeData():
  #save the csv
  np.savetxt(fn + '.lat.csv', lat, delimiter=',')
  np.savetxt(fn + '.lon.csv', lon, delimiter=',')
  np.savetxt(fn + '.data.csv', th, delimiter=',')

  output_zip = zipfile.ZipFile(fn+'.zip', 'w')
  output_zip.write(fn + '.lat.csv', compress_type=zipfile.ZIP_DEFLATED)
  output_zip.write(fn + '.lon.csv', compress_type=zipfile.ZIP_DEFLATED)
  output_zip.write(fn + '.data.csv', compress_type=zipfile.ZIP_DEFLATED)
  output_zip.close()

  purge('../../data/output/', args.fn + '(.+)(.csv)')

months={"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11,"Movie":-1, "Year":-2}
t0=months[args.time]

if t0 == -2:
    yearAverage = True
    t0=0
else:
    yearAverage = False

if t0 == -1:
  t0=0
  t1=11
else:
  t1=t0


press=int(args.press)
lev0=np.argmin(np.abs(level-press))

nr=range(t0,t1+1)
print "nr", nr, t0, t1
for n in nr:
  if t1 > 0 and n == 0:
    print "getting n0", n
    th = getTheta(theta,n,lev0)
    min = float(args.min)
    max = float(args.max)
    splotit(th, min, max)
  else:
    print "getting n1", n
    th = getTheta(theta,n,lev0)
    min = float(args.min)
    max = float(args.max)
    splotit(th, min, max)

print (json.dumps({
    'output': 'ok'
}))