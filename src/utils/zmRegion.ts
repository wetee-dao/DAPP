import provinces from './provinces.json'
import areas from './areas.json'
import cities from './cities.json'

export const zmGetProvinces = () => {
    return provinces;
}

export const zmGetcities = (provinceCode: any) => {
    if (!provinceCode) {
        provinceCode = '11'
    }
    let citiesArr: { code: string; name: string; provinceCode: string; }[] = [];
    cities.forEach(function (item) {
        if (item.provinceCode == provinceCode) {
            citiesArr.push(item)
        }
    })
    return citiesArr
}

export const zmGetareas = (cityCode: any) => {
    if (!cityCode) {
        cityCode = '1101'
    }
    let areasArr: { code: string; name: string; cityCode: string; provinceCode: string; }[] = [];
    areas.forEach(function (item) {
        if (item.cityCode == cityCode) {
            areasArr.push(item)
        }
    })
    return areasArr
}

export const codeToName = (code: any) => {
    let areaCode = String(code)
    let provinceCode = areaCode.substring(0, 2)
    let cityCode = areaCode.substring(0, 4)

    let cs = zmGetcities(provinceCode)
    let ars = zmGetareas(cityCode)
    let province = provinces.findIndex((v) => provinceCode == v.code)
    let city = cs.findIndex((v) => cityCode == v.code)
    let area = ars.findIndex((v) => areaCode == v.code)

    return {
        items: [provinces[province], cs[city], ars[area]],
        indexs: [province, city, area]
    }
}