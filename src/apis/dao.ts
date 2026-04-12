import { $getQueryApi } from "@/plugins/chain";
import { BN } from "@polkadot/util";
import { ElNotification } from "element-plus";

// DAO 合约地址（需要根据实际情况配置）
let daoContractAddress = "";

export function setDaoContractAddress(address: string) {
  daoContractAddress = address;
}

export function getDaoContractAddress(): string {
  return daoContractAddress;
}

// 提案状态枚举
export enum PropStatus {
  Pending = "Pending",
  Ongoing = "Ongoing",
  Confirming = "Confirming",
  Approved = "Approved",
  Rejected = "Rejected",
  Canceled = "Canceled",
}

// 投票意见枚举
export enum Opinion {
  YES = 0,
  NO = 1,
}

// 获取成员列表
export async function getMemberList(): Promise<string[]> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "list", {});
    return result || [];
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取成员列表失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取提案列表
export async function getProposals(page: number = 0, size: number = 20): Promise<any[]> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "proposals", {
      page: page,
      size: size,
    });
    return result || [];
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取提案列表失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取提案详情
export async function getProposal(id: number): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "proposal", {
      id: id,
    });
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取提案详情失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取提案状态
export async function getProposalStatus(id: number): Promise<PropStatus> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "proposal_status", {
      proposal_id: id,
    });
    return result as PropStatus;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取提案状态失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取投票列表
export async function getVoteList(proposalId: number): Promise<any[]> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "vote_list", {
      proposal_id: proposalId,
    });
    return result || [];
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取投票列表失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取轨道列表
export async function getTrackList(page: number = 0, size: number = 20): Promise<any[]> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "track_list", {
      page: page,
      size: size,
    });
    return result || [];
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取轨道列表失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取轨道详情
export async function getTrack(id: number): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "track", {
      id: id,
    });
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取轨道详情失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取默认轨道
export async function getDefaultTrack(): Promise<number | null> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "defalut_track", {});
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取默认轨道失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取用户余额
export async function getBalance(owner: string): Promise<string> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "balance_of", {
      owner: owner,
    });
    return result || "0";
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取余额失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 获取锁定余额
export async function getLockBalance(owner: string): Promise<string> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "lock_balance_of", {
      owner: owner,
    });
    return result || "0";
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "获取锁定余额失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 提交提案
export async function submitProposal(
  call: any,
  trackId: number
): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "submit_proposal", {
      call: call,
      track_id: trackId,
    }, "0");
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "提交提案失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 支付决定押金
export async function depositProposal(proposalId: number, amount: string): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "deposit_proposal", {
      proposal_id: proposalId,
    }, amount);
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "支付决定押金失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 提交投票
export async function submitVote(
  proposalId: number,
  opinion: Opinion,
  amount: string
): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "submit_vote", {
      proposal_id: proposalId,
      opinion: opinion,
    }, amount);
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "提交投票失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 取消投票
export async function cancelVote(voteId: number): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "cancel_vote", {
      vote_id: voteId,
    }, "0");
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "取消投票失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 解锁投票代币
export async function unlockVote(voteId: number): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "unlock", {
      vote_id: voteId,
    }, "0");
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "解锁投票代币失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 执行提案
export async function execProposal(proposalId: number): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "exec_proposal", {
      proposal_id: proposalId,
    }, "0");
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "执行提案失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 取消提案
export async function cancelProposal(proposalId: number): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "cancel_proposal", {
      proposal_id: proposalId,
    }, "0");
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "取消提案失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 查询是否允许公开加入
export async function getPublicJoin(): Promise<boolean> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_query(daoContractAddress, "public_join", {});
    return result || false;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "查询公开加入状态失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 公开加入DAO
export async function publicJoin(): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "public_join", {}, "0");
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "公开加入DAO失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}

// 退出DAO
export async function leave(): Promise<any> {
  try {
    const api = $getQueryApi();
    const result = await (api as any).ink_builder(daoContractAddress, "leave", {}, "0");
    return result;
  } catch (error: any) {
    ElNotification({
      title: "错误",
      message: "退出DAO失败: " + (error.message || error),
      type: "error",
    });
    throw error;
  }
}
