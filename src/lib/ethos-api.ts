// // Ethos API Configuration
// const ETHOS_API_CONFIG = {
//   baseUrl: 'https://api.ethos.network/api/v2/score/userId',
//   clientName: 'ethos-p2p-platform'
// };

// export interface SocialAccount {
//   platform: 'twitter' | 'discord';
//   username: string;
//   userId?: string;
// }

// export interface EthosScoreData {
//   score: number;
//   isPending?: boolean;
// }

// export const ethosAPI = {
//   fetchScoreByUserkey: async (userkey: string): Promise<number> => {
//     try {
//       const response = await fetch(
//         `${ETHOS_API_CONFIG.baseUrl}/score/userkey?userkey=${encodeURIComponent(userkey)}`,
//         {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'X-Client': ETHOS_API_CONFIG.clientName
//           }
//         }
//       );
//       if (!response.ok) {
//         if (response.status === 404) return 1000;
//         throw new Error(`Ethos API error: ${response.status}`);
//       }
//       const data = await response.json();
//       return data?.score ?? 1000;
//     } catch (err) {
//       console.error('Ethos fetchScoreByUserkey failed:', err);
//       return 1000;
//     }
//   },

//   fetchScoresByUserkeys: async (userkeys: string[]): Promise<Record<string, number>> => {
//     try {
//       const response = await fetch(
//         `${ETHOS_API_CONFIG.baseUrl}/score/userkeys`,
//         {
//           method: 'POST',
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//             'X-Client': ETHOS_API_CONFIG.clientName
//           },
//           body: JSON.stringify({ userkeys })
//         }
//       );
//       if (!response.ok) {
//         throw new Error(`Ethos API error: ${response.status}`);
//       }
//       const data = await response.json();
//       const scores: Record<string, number> = {};
//       userkeys.forEach(k => {
//         scores[k] = data?.[k]?.score ?? 1000;
//       });
//       return scores;
//     } catch (err) {
//       console.error('Ethos fetchScoresByUserkeys failed:', err);
//       return Object.fromEntries(userkeys.map(k => [k, 1000]));
//     }
//   },

//   checkScoreStatus: async (userkey: string): Promise<{ isPending: boolean }> => {
//     try {
//       const response = await fetch(
//         `${ETHOS_API_CONFIG.baseUrl}/score/status?userkey=${encodeURIComponent(userkey)}`,
//         {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'X-Client': ETHOS_API_CONFIG.clientName
//           }
//         }
//       );
//       if (!response.ok) {
//         throw new Error(`Ethos API error: ${response.status}`);
//       }
//       return await response.json();
//     } catch (err) {
//       console.error('Ethos checkScoreStatus failed:', err);
//       return { isPending: false };
//     }
//   },

//   createUserkey: (socialAccount: SocialAccount): string => {
//     return `${socialAccount.platform}:${socialAccount.username.replace('@', '')}`;
//   }
// };

// // Trust tier definitions based on Ethos score
// export const TRUST_TIERS = {
//   UNTRUSTED: { min: 0, max: 1399, label: 'Untrusted', color: 'destructive', maxTrade: 0 },
//   BASIC: { min: 1400, max: 1599, label: 'Basic Trust', color: 'warning', maxTrade: 500 },
//   TRUSTED: { min: 1600, max: 1799, label: 'Trusted', color: 'success', maxTrade: 1000 },
//   VERIFIED: { min: 1800, max: 1999, label: 'Verified', color: 'info', maxTrade: 5000 },
//   ELITE: { min: 2000, max: Infinity, label: 'Elite', color: 'elite', maxTrade: 25000 }
// };

// export const getTrustTier = (score: number) => {
//   for (const [key, tier] of Object.entries(TRUST_TIERS)) {
//     if (score >= tier.min && score <= tier.max) {
//       return { key, ...tier };
//     }
//   }
//   return { key: 'UNTRUSTED', ...TRUST_TIERS.UNTRUSTED };
// };

// export const getMaxConcurrentDeals = (score: number): number => {
//   if (score >= 2000) return 10;
//   if (score >= 1800) return 5;
//   if (score >= 1600) return 3;
//   if (score >= 1400) return 1;
//   return 0;
// };



// Ethos API Configuration
const ETHOS_API_CONFIG = {
  baseUrl: 'https://api.ethos.network/api/v2/score',
  clientName: 'ethos-p2p-platform'
};

export interface SocialAccount {
  platform: 'twitter' | 'discord';
  username: string;
  userId?: number;
}

export interface EthosScoreData {
  score: number;
  level: string;
  [key: string]: any;
}

export const ethosAPI = {

  // Fetch score by userkey
  fetchScoreByUserkey: async (userkey: string): Promise<EthosScoreData | null> => {
    try {
      const response = await fetch(
        `${ETHOS_API_CONFIG.baseUrl}/userkey?userkey=${encodeURIComponent(userkey)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Client': ETHOS_API_CONFIG.clientName
          }
        }
      );

      if (!response.ok) {
        console.error("Error fetching userkey score:", response.status, await response.text());
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error('Ethos fetchScoreByUserkey failed:', err);
      return null;
    }
  },

  // Fetch score by userId
  fetchScoreByUserId: async (userId: number): Promise<EthosScoreData | null> => {
    try {
      const response = await fetch(
        `${ETHOS_API_CONFIG.baseUrl}/userId?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Client': ETHOS_API_CONFIG.clientName
          }
        }
      );

      if (!response.ok) {
        console.error("Error fetching userId score:", response.status, await response.text());
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error('Ethos fetchScoreByUserId failed:', err);
      return null;
    }
  },

  // Bulk fetch scores using userkeys
  fetchScoresByUserkeys: async (userkeys: string[]): Promise<Record<string, EthosScoreData | null>> => {
    try {
      const response = await fetch(
        `${ETHOS_API_CONFIG.baseUrl}/userkeys`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Client': ETHOS_API_CONFIG.clientName
          },
          body: JSON.stringify({ userkeys })
        }
      );

      if (!response.ok) {
        console.error("Error bulk fetching userkeys:", response.status, await response.text());
        return Object.fromEntries(userkeys.map(k => [k, null]));
      }

      const data = await response.json();
      const result: Record<string, EthosScoreData | null> = {};

      userkeys.forEach((key) => {
        result[key] = data[key] ?? null;
      });

      return result;

    } catch (err) {
      console.error('Ethos fetchScoresByUserkeys failed:', err);
      return Object.fromEntries(userkeys.map(k => [k, null]));
    }
  },

  // Bulk fetch scores using userIds
  fetchScoresByUserIds: async (userIds: number[]): Promise<Record<number, EthosScoreData | null>> => {
    try {
      const response = await fetch(
        `${ETHOS_API_CONFIG.baseUrl}/userIds`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Client': ETHOS_API_CONFIG.clientName
          },
          body: JSON.stringify({ userIds })
        }
      );

      if (!response.ok) {
        console.error("Error bulk fetching userIds:", response.status, await response.text());
        return Object.fromEntries(userIds.map(id => [id, null]));
      }

      const data = await response.json();
      const result: Record<number, EthosScoreData | null> = {};

      userIds.forEach((id) => {
        result[id] = data[id] ?? null;
      });

      return result;

    } catch (err) {
      console.error('Ethos fetchScoresByUserIds failed:', err);
      return Object.fromEntries(userIds.map(id => [id, null]));
    }
  },

  // Check if score calculation is still pending
  checkScoreStatus: async (userkey: string): Promise<{ isPending: boolean } | null> => {
    try {
      const response = await fetch(
        `${ETHOS_API_CONFIG.baseUrl}/status?userkey=${encodeURIComponent(userkey)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Client': ETHOS_API_CONFIG.clientName
          }
        }
      );

      if (!response.ok) {
        console.error("Error checking score status:", response.status, await response.text());
        return null;
      }

      return await response.json();

    } catch (err) {
      console.error('Ethos checkScoreStatus failed:', err);
      return null;
    }
  },

  // Create a userkey string based on social account
  createUserkey: (socialAccount: SocialAccount): string => {
    return `${socialAccount.platform}:${socialAccount.username.replace('@', '')}`;
  }
};
