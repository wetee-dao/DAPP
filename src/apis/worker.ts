import axios from "axios";

export async function GetLogs(cluster: any, c: any) {
  let params = `
    query{
			work_loglist(
        user:"`+ c.User + `",
				pod_id: `+ c.Id + `,
				start: "",
				size: 10,
      ){
        data
      }
    }
  `

  const dns = await GetClusterDns(cluster)
  const response = await axios.post('https://' + dns + '/gql', {
    query: params
  })
  const data = response.data.data.work_loglist
  return JSON.parse(data.data).reverse()
}

export async function GetWetrics(cluster: any, c: any) {
  console.log(c)
  let params = `
    query{
			work_wetriclist(
        user:"`+ c.User + `",
				pod_id: `+ c.Id + `,
				start: "",
				size: 60,
			){
        data
      }
    }
  `

  const dns = await GetClusterDns(cluster)
  const response = await axios.post('https://' + dns + '/gql', {
    query: params
  })

  const data = response.data.data.work_wetriclist
  return JSON.parse(data.data).reverse()
}

export async function GetServices(cluster: any, c: any) {
  let project_id = c.ProjectId
  let params = `
    query{
      work_servicelist(
        user:"`+ project_id + `",
        pod_id:`+ c.Id + `,
      ){
        Type
        Ports{
          Name
          Protocol
          Port
          NodePort
        }
      }
    }
  `

  const dns = await GetClusterDns(cluster)
  const response = await axios.post('https://' + dns + '/gql', {
    query: params
  })

  const data = response.data.data.work_servicelist
  return data
}

export async function GetClusterDns(cinfo: any) {
  return cinfo.ip.domain + ':30000'
  // cinfo.port.replaceAll(",", "")
}

