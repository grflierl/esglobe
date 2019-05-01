# python gm.py csvfile lat lon
#  python whereami 38.6 -7.7
from PIL import Image
import numpy as np
import csv
import sys
import os
os.environ['MPLCONFIGDIR'] = '/tmp/'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from countries_gm import countries

lat=float(sys.argv[2])
lon=float(sys.argv[3])

im=Image.open("map.pgm")
i=int(np.round((lon+180)/360*(im.size[0]-1)))
j=int(np.round((90-lat)/180*(im.size[1]-1)))
cn=im.getpixel((i,j))
print i,j,cn
print "<h2>"
try:
    c=countries.values().index(cn)
    country=countries.keys()[c]
except:
    country=''

fd=open(sys.argv[1],"U")
rdr=csv.reader(fd)
row=rdr.next()
title=row[0].strip()
print title
yr=[]
for n in range(1,len(row)):
    yr.append(row[n].strip())
print yr

v=[];
while True:
    try:
        row=rdr.next()
    except:
        break
    if len(row)==0: break
#    print row[0]
    if row[0]==country:
        for n in range(1,len(row)):
            vs=row[n].strip()
            if len(vs)>0:
                val=float(vs)
            else:
                val=np.NaN
            v.append(val)
        print v
fd.close()

if len(v)>0:
    plt.plot(yr,v,'o',yr,v)
    plt.xticks(range(0,len(yr),10))
#    plt.xlim(int(yr[0]),int(yr[-1]))
    plt.title(title)
    plt.xlabel(country)
else:
    plt.title("No data")
    plt.xlabel(country)
plt.savefig("/tmp/gm.jpg")
#plt.show()
