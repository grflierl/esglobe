from matplotlib.colors import LinearSegmentedColormap
import matplotlib.pyplot as plt
import numpy as np

def customColorMap(vcent, vrange, vmin, vmax):

    # print "custom color map", vcent, vrange, vmin, vmax
    # vmin = 225
    # vmax = 950
    # vcent = 500
    # vrange = 100

    cm = plt.cm.jet
    colorIdx = np.arange(1, 256, 1)

    arr = np.array([])
    colorList = []
    for i in colorIdx:
        colorList.append(cm(colorIdx[i-1]))

    colorList = np.asarray(colorList)

    v = np.arange(0,255,1)
    v = v / 255.0
    v = v * (vmax-vmin) + vmin

    #print v

    tanhv = np.tanh((v-vcent)/vrange) + 1
    tanhv = (tanhv-tanhv.min())/(tanhv.max()-tanhv.min())

    #print tanhv
    x_str = np.array_repr(tanhv).replace('\n', '')
    #print(x_str)

    newMapIndexArr = np.floor(tanhv*255.999)
    #print newMapIndexArr
    newColorList = []

    for i in newMapIndexArr:
        if i > colorList.shape[0] - 1:
            i = colorList.shape[0] - 1
        newColorList.append(colorList[int(i)])

    newColorList = np.asarray(newColorList).tolist()

    cm = LinearSegmentedColormap.from_list(
        'tanh', newColorList, N=255)

    return cm

def thetaColorMap(depth):
    print "thetacolormap", depth
    depth = float(depth)
    if depth <= 5:
        min = -10
        max = 40
        vcenter = 0
        vrange = 50
    elif depth < 10:
        min = -10
        max = 40
        vcenter = 0
        vrange = 40
    elif depth < 20:
        min = -20
        max = 40
        vcenter = 0
        vrange = 30
    elif depth <= 50:
        min = -20
        max = 20
        vcenter = 0
        vrange = 40
    else:
        min = -20
        max = 50
        vcenter = 0
        vrange = 70

    print min, max, vcenter, vrange
    return [min, max, vcenter, vrange]


def evelmassColorMap(depth):
    depth = float(depth)
    min = -1
    max = 1
    vcenter = 0
    vrange = 2

    return [min, max, vcenter, vrange]

def nvelmassColorMap(depth):
    depth = float(depth)
    min = -1
    max = 1
    vcenter = 0
    vrange = 2

    return [min, max, vcenter, vrange]



def oceTaueColorMap(depth):
    depth = float(depth)
    min = -0.2
    max = 0.25
    vcenter = 0
    vrange = 1

    return [min, max, vcenter, vrange]

def oceTaunColorMap(depth):
    depth = float(depth)
    min = -0.2
    max = 0.25
    vcenter = 0
    vrange = 1

    return [min, max, vcenter, vrange]
