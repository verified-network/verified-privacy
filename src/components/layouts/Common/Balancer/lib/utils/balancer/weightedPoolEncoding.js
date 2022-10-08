import {WeightedPoolEncoder} from '@balancer-labs/sdk';

export function encodeJoinWeightedPool(joinData) {
  if (joinData.kind == 'Init') {
    return WeightedPoolEncoder.joinInit(joinData.amountsIn);
  } else if (joinData.kind == 'ExactTokensInForBPTOut') {
    return WeightedPoolEncoder.joinExactTokensInForBPTOut(
      joinData.amountsIn,
      joinData.minimumBPT
    );
  } else if (joinData.kind == 'AllTokensInForExactBPTOut') {
    return WeightedPoolEncoder.joinAllTokensInForExactBPTOut(
      joinData.bptAmountOut
    );
  } else {
    return WeightedPoolEncoder.joinTokenInForExactBPTOut(
      joinData.bptAmountOut,
      joinData.enterTokenIndex
    );
  }
}

export function encodeExitWeightedPool(exitData) {
  if (exitData.kind == 'ExactBPTInForOneTokenOut') {
    return WeightedPoolEncoder.exitExactBPTInForOneTokenOut(
      exitData.bptAmountIn,
      exitData.exitTokenIndex
    );
  } else if (exitData.kind == 'ExactBPTInForTokensOut') {
    return WeightedPoolEncoder.exitExactBPTInForTokensOut(exitData.bptAmountIn);
  } else {
    return WeightedPoolEncoder.exitBPTInForExactTokensOut(
      exitData.amountsOut,
      exitData.maxBPTAmountIn
    );
  }
}
