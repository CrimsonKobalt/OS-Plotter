module.exports = function compare(a, b){
    if(a.getServiceTime() < b.getServiceTime()){
        return -1;
    }

    if(a.getServiceTime() > b.getServiceTime()){
        return 1;
    }
    return 0;
}