import { chainIndexer } from "@/plugins/chain";
import { GraphqlClient } from "@/utils/gql";

const addContractCodeMut = `mutation upload_contract_abi(
  $project: String!
  $abi: String!
){
  upload_contract_abi(
    project: $project
    abi: $abi
  )
}`;

export const addContractCode = async (ps: any) => {
  return await (new GraphqlClient(chainIndexer)).query({
    query: addContractCodeMut,
    variables: ps
  })
};

const contractAbiQuery = `query list_contract_abi(
  $project: String!
  $page: Int!
  $page_size: Int!
){
  list_contract_abi(
    project: $project
    page: $page
    page_size: $page_size
  )
}`;

export const getContractAbi = async (project: any, page = 1, page_size = 100) => {
  return await (new GraphqlClient(chainIndexer)).query({
    query: contractAbiQuery,
    variables: { project, page, page_size }
  })
};

const contractsQuery = `query list_contract(
  $project: String!
  $page: Int!
  $page_size: Int!
){
  list_contract(
    project: $project
    page: $page
    page_size: $page_size
  ){
    project
    contract
    code_hash
    abi
  }
}`;

export const getContracts = async (project: any, page = 1, page_size = 100) => {
  return await (new GraphqlClient(chainIndexer)).query({
    query: contractsQuery,
    variables: { project, page, page_size }
  })
};

const eventQuery = `query list_event(
  $project: String!
  $page: Int!
  $page_size: Int!
){
  list_event(
    project: $project
    page: $page
    page_size: $page_size
  ){
    project
    work_id
    work_type
    action
  }
}`;

export const getEvent = async (project: any, page = 1, page_size = 100) => {
  return await (new GraphqlClient(chainIndexer)).query({
    query: eventQuery,
    variables: { project, page, page_size }
  })
};
