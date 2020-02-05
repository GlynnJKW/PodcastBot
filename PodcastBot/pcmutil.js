let VolumeFromData = function(data){
    let sum = 0;
    if(data.length == 0){
        return sum;
    }
    else{
        for(let datum of data){
            sum += datum;
        }
    }

    let avg = sum/data.length;
    let sumMnSq = 0;
    for(let datum of data){
        sumMnSq += Math.pow(datum - avg, 2);
    }
    let avgMnSq = sumMnSq / data.length;
    let vol = 1 / Math.sqrt(avgMnSq) * 100;
    vol += 0.2;
    return vol != null ? vol : 0;
}

module.exports = { VolumeFromData }