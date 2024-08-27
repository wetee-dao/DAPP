// import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core';
// import { setContext } from '@apollo/client/link/context';
// import { onError } from '@apollo/client/link/error';
// import { ElMessage } from 'element-plus';

// let uri = '';
// if (localStorage.getItem('uri')) {
//   uri = localStorage.getItem('uri') || '';
// } else if ((window as any).config != null) {
//   uri = (window as any).config.uri
// }

// // 与 API 的 HTTP 连接
// const httpLink = createHttpLink({
//   // 你需要在这里使用绝对路径
//   uri
// });

// // 缓存实现
// const cache = new InMemoryCache();

// const authLink = setContext((_: any, { headers }: any) => {
//   // get the authentication token from local storage if it exists
//   const token = localStorage.getItem('token');
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? token : ''
//     }
//   };
// });

// const errLink = onError(({ graphQLErrors, networkError }) => {
//   if (graphQLErrors) {
//     graphQLErrors.map(({ message, locations, path }) => {
//       console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
//       if (message.indexOf('登陆过期请重新登录') > -1) {
//         localStorage.clear();
//         window.location.href = '/login';
//         return;
//       }
//       if (message == '请先登录') {
//         window.location.href = '/login';
//         return;
//       }
//       ElMessage.error(message);
//     });
//   }

//   if (networkError) {
//     ElMessage.error('请检查网络或联系客服');
//     console.log(`[Network error]: ${networkError}`);
//   }
// });

// // 创建 apollo 客户端
// export const apolloClient = new ApolloClient({
//   defaultOptions: {
//     watchQuery: {
//       fetchPolicy: 'network-only'
//       // errorPolicy: 'ignore'
//     },
//     query: {
//       fetchPolicy: 'network-only'
//       // errorPolicy: 'all'
//     },
//     mutate: {
//       // errorPolicy: 'all'
//     }
//   },
//   link: authLink.concat(errLink).concat(httpLink),
//   // link: httpLink,
//   cache
// });
