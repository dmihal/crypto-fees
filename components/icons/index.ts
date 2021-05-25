import aave from './aave.svg';
import ada from './ada.svg';
import avalanche from './avalanche.svg';
import balancer from './balancer.svg';
import bancor from './bancor.png';
import bch from './bch.svg';
import bnb from './bnb.svg';
import bsv from './bsv.svg';
import btc from './btc.svg';
import compound from './compound.svg';
import curve from './curve.png';
import hegic from './hegic.png';
import doge from './doge.svg';
import eth from './eth.svg';
import futureswap from './futureswap.svg';
import honeyswap from './honeyswap.png';
import kusama from './kusama.svg';
import ltc from './ltc.svg';
import maker from './maker.svg';
import mstable from './mstable.svg';
import omen from './omen.png';
import polkadot from './polkadot.svg';
import polygon from './polygon.svg';
import polymarket from './polymarket.svg';
import quickswap from './quickswap.png';
import ren from './ren.svg';
import sushiswap from './sushiswap.svg';
import synthetix from './synthetix.svg';
import tbtc from './tbtc.svg';
import terra from './terra.svg';
import tornado from './tornado.svg';
import uniV1 from './uni_v1.png';
import uniV2 from './uni_v2.svg';
import xlm from './xlm.svg';
import xmr from './xmr.svg';
import xrp from './xrp.svg';
import xtz from './xtz.svg';
import linkswap from './linkswap.svg';
import zerox from './zrx.svg';
import zilliqa from './zilliqa.svg';

const icons: { [id: string]: string } = {
  aave,
  ada,
  avalanche,
  balancer,
  bancor,
  bch,
  bnb_mainnet: bnb, // eslint-disable-line @typescript-eslint/camelcase
  bsv,
  btc,
  compound,
  curve,
  hegic,
  honeyswap,
  doge,
  eth,
  futureswap,
  ren,
  kusama,
  ltc,
  maker,
  mstable,
  omen,
  polkadot,
  polygon,
  polymarket,
  quickswap,
  sushiswap,
  synthetix,
  tbtc,
  terra,
  tornado,
  'uniswap-v1': uniV1,
  'uniswap-v2': uniV2,
  'uniswap-v3': uniV2,
  xlm,
  xmr,
  xrp,
  xtz,
  linkswap,
  zerox,
  zilliqa,
};

export default icons;
