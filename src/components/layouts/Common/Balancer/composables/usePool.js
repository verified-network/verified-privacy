import {getAddress} from 'ethers/lib/utils';
import {POOLS} from '../constants/pools';
import {
  PoolType,
} from '../types';

export function addressFor(poolId) {
  return getAddress(poolId.slice(0, 42));
}

export function isStable(poolType) {
  return poolType === PoolType.Stable;
}

export function isMetaStable(poolType) {
  return poolType === PoolType.MetaStable;
}

export function isStablePhantom(poolType) {
  return poolType === PoolType.StablePhantom;
}

export function isStableLike(poolType) {
  return (
    isStable(poolType) || isMetaStable(poolType) || isStablePhantom(poolType)
  );
}

export function isLiquidityBootstrapping(poolType) {
  return poolType === PoolType.LiquidityBootstrapping;
}

export function isWeighted(poolType) {
  return poolType === PoolType.Weighted;
}

export function isManaged(poolType) {
  // Correct terminology is managed pools but subgraph still returns poolType = "Investment"
  return poolType === PoolType.Investment;
}

export function isWeightedLike(poolType) {
  return (
    isWeighted(poolType) ||
    isManaged(poolType) ||
    isLiquidityBootstrapping(poolType)
  );
}

export function isTradingHaltable(poolType) {
  return isManaged(poolType) || isLiquidityBootstrapping(poolType);
}

export function orderedPoolTokens(
  poolType,
  poolAddress,
  tokens) {
  if (isStablePhantom(poolType)) {
    return tokens.filter((token) => token.address !== poolAddress);
  }
  if (isStableLike(poolType)) return tokens;

  return tokens
    .slice()
    .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
}

export function usePool(pool) {
  return {
    isStable,
    isMetaStable,
    isStablePhantom,
    isStableLike,
    isWeighted,
    isLiquidityBootstrapping,
    isWeightedLike,
    isTradingHaltable,
    orderedPoolTokens,
  };
}
