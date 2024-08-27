import { chainIndexer } from "@/plugins/chain";
import { GraphqlClient } from "@/utils/gql";

const eventsQuery = `query list_event(
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
  
  export const getEvents = async (project: any, page = 1, page_size = 100) => {
    return await (new GraphqlClient(chainIndexer)).query({
      query: eventsQuery,
      variables: { project, page, page_size }
    })
  };