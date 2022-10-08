import {StablePoolEncoder} from '@balancer-labs/sdk';

export function encodeJoinStablePool(joinData) {
  if (joinData.kind == 'Init') {
    return StablePoolEncoder.joinInit(joinData.amountsIn);
  } else if (joinData.kind == 'ExactTokensInForBPTOut') {
    return StablePoolEncoder.joinExactTokensInForBPTOut(joinData.amountsIn, joinData.minimumBPT);
  } else {
    return StablePoolEncoder.joinTokenInForExactBPTOut(joinData.bptAmountOut, joinData.enterTokenIndex);
  }
}

export function encodeExitStablePool(exitData) {
  if (exitData.kind == 'ExactBPTInForOneTokenOut') {
    return StablePoolEncoder.exitExactBPTInForOneTokenOut(exitData.bptAmountIn, exitData.exitTokenIndex);
  } else if (exitData.kind == 'ExactBPTInForTokensOut') {
    return StablePoolEncoder.exitExactBPTInForTokensOut(exitData.bptAmountIn);
  } else {
    return StablePoolEncoder.exitBPTInForExactTokensOut(exitData.amountsOut, exitData.maxBPTAmountIn);
  }
}
