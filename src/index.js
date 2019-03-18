import fetch from 'node-fetch';
import qs from 'qs';
import stringifyObject from 'stringify-object';

// const FINRA_LOGIN_URL = 'http://finra-markets.morningstar.com/finralogin.jsp';

const getCookieFromHeader = res => res.headers.get('set-cookie');

const parseResponse = res => JSON.parse(res.trim().replace(/(['"])?([a-zA-Z_]+)(['"])?:/g, '"$2": '));

// const getCookies = async () => {
//   const [details, prospectus] = await Promise.all([
//     fetch(FINRA_LOGIN_URL, { method: 'POST' }),
//     fetch('http://doc.morningstar.com/BondDoc.aspx?clientid=pst&key=2a32c10e40ff4620'),
//   ]);

//   return {
//     details: getCookieFromHeader(details),
//     propsectus: getCookieFromHeader(prospectus),
//   };
// };

const getBondCookies = async () => {
  const response = await fetch('http://finra-markets.morningstar.com/finralogin.jsp', {
    method: 'post',
  });
  return getCookieFromHeader(response);
};

const getLastPrice = async (symbol) => {
  const cookies = await getBondCookies();
  const query = stringifyObject({
    Keywords: [{ Name: 'traceOrCusipOrBloomberg', Value: symbol }],
  });
  const body = qs.stringify({ count: 1, query, searchType: 'B' });
  const response = await fetch('http://finra-markets.morningstar.com/bondSearch.jsp', {
    method: 'post',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'http://finra-markets.morningstar.com/BondCenter/Results.jsp',
      Cookie: cookies,
    },
  }).then(res => res.text());
  const parsed = parseResponse(response);
  const bond = parsed.B.Columns[0];
  const formatted = {
    symbol: bond.symbol,
    cusip: bond.cusip,
    yield: bond.yield,
    price: bond.price,
    tradeDate: bond.tradeDate,
    maturityDate: bond.maturityDate,
    coupon: {
      rate: bond.couponRate,
      type: bond.couponType,
    },
  };

  console.log(formatted);

  return formatted;
};

// const getBondDetails = async (bond, bondCookie) => {
//   const [
//     prices,
//     yields,
//     bondElements,
//     classificationElements,
//     ratingElements,
//     issueElements,
//     prospectus,
//   ] = await Promise.all([
//     fetch(
//       `http://mschart.morningstar.com/chartweb/defaultChart?type=getbond&t=${
//         bond.securityId
//       }&startdate=1900-01-01&enddate=2017-06-14&format=1&charttype=price`,
//     ),
//     fetch(
//       `http://mschart.morningstar.com/chartweb/defaultChart?type=getbond&t=${
//         bond.securityId
//       }&startdate=1900-01-01&enddate=2017-06-14&format=1&charttype=yield`,
//     ),
//     fetch(`http://quotes.morningstar.com/bondq/quote/c-bond?&t=${bond.securityId}`),
//     fetch(`http://quotes.morningstar.com/bondq/quote/c-classification?&t=${bond.securityId}`),
//     fetch(`http://quotes.morningstar.com/bondq/quote/c-credit?&t=${bond.securityId}`),
//     fetch(`http://quotes.morningstar.com/bondq/quote/c-issue?&t=${bond.securityId}`),
//     fetch(
//       `http://doc.morningstar.com/ajaxService/GetBondData.ashx?identifier=${
//         bond.cusip
//       }&IdentifierType=1&action=getBondInfo`,
//       {
//         headers: {
//           Cookie: bondCookie,
//         },
//       },
//     ),
//   ]);

//   return {
//     ...bond,
//     priceHistory: prices.data,
//     yieldHistory: yields.data,
//   };
// };

// const getBonds = async (company) => {
//   const cookies = await getCookies();
//   const query = stringifyObject({
//     Kewyords: [
//       { Name: 'debtOrAssetClass', Value: '3' },
//       { Name: 'showResultsAs', Value: 'B' },
//       { Name: 'issuerName', Value: company },
//     ],
//   });
//   const body = qs.stringify({ count: 400, query, searchType: 'B' });
//   const response = await fetch('http://finra-markets.morningstar.com/bondSearch.jsp', {
//     method: 'post',
//     body,
//     headers: {
//       Cookie: cookies,
//       Referer: 'http://finra-markets.morningstar.com/BondCenter/Results.jsp',
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//   }).then(res => res.text());

//   const parsed = parseResponse(response);

//   const bonds = await Promise.all(parsed.B.Columns.map(bond => getBondDetails(bond, cookies)));

//   return bonds;
// };

export default {
  getLastPrice,
};
