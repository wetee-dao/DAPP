import axios from "axios";
import { getChainExt, getHttpApi } from "@/plugins/chain";
import { ss58toHex } from "@/utils/chain";

export async function GetLogs(cluster: number, c: any) {
  let params = `
    query{
			work_loglist(
				work_type: "`+ c.Type + `",
				work_id: `+ c.Nid + `,
				page: 1,
				size: 10,
			)
    }
  `

  const dns = await GetClusterDns(cluster)
  const response = await axios.post('https://' + dns + '/gql', {
    query: params
  })
  const data = response.data.data.work_loglist
  return JSON.parse(data).reverse()
}

export async function GetWetrics(cluster: number, c: any) {
  let params = `
    query{
			work_wetriclist(
				work_type: "`+ c.Type + `",
				work_id: `+ c.Nid + `,
				page: 1,
				size: 60,
			)
    }
  `

  const dns = await GetClusterDns(cluster)
  const response = await axios.post('https://' + dns + '/gql', {
    query: params
  })

  const data = response.data.data.work_wetriclist
  return JSON.parse(data).reverse()
}

export async function GetServices(cluster: number, c: any) {
  let project_id = ss58toHex(c.ProjectId)
  let params = `
    query{
      work_servicelist(
        project_id:"`+ project_id + `",
        work_type:"`+ c.Type + `",
        work_id:`+ c.Nid + `,
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

export async function GetClusterDns(cluster: number) {
  const cinfo = await GetClusterInfo(cluster)
  return cinfo.ip[0].domain + ':' + cinfo.port.replaceAll(",", "")
}

export async function GetClusterInfo(cluster: number) {
  let clusterInfo = window.localStorage.getItem("cluster_" + cluster)
  if (clusterInfo) {
    return JSON.parse(clusterInfo)
  }

  const info = await getHttpApi().query("worker","k8sClusters",[cluster])
  window.localStorage.setItem("cluster_" + cluster, JSON.stringify(info))
  return info
}