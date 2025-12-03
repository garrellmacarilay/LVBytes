/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} email
 * @property {boolean} isVerified
 * @property {string} address
 */

/**
 * Enum-like object for RiskLevel
 */
export const RiskLevel = {
  LOW: "Low",
  MODERATE: "Moderate",
  HIGH: "High",
  CRITICAL: "Critical"
};

/**
 * @typedef {Object} Alert
 * @property {string} id
 * @property {'watch' | 'warning' | 'advisory' | 'update'} type
 * @property {'low' | 'medium' | 'high' | 'critical'} severity
 * @property {string} title
 * @property {string} message
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {'user' | 'model'} role
 * @property {string} text
 * @property {Date} timestamp
 * @property {boolean} [isStreaming]
 */

/**
 * @typedef {Object} WeatherStats
 * @property {number} rainfall
 * @property {number} windSpeed
 * @property {number} waterLevel
 * @property {'rising' | 'falling' | 'stable'} trend
 * @property {string} condition
 * @property {string} locationName
 */

/**
 * @typedef {Object} EvacuationCenter
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {number} distance
 * @property {'Open' | 'Full' | 'Closed'} status
 * @property {number} occupancy
 * @property {{ current: number, max: number }} capacityCount
 * @property {{ lat: number, lng: number }} coordinates
 * @property {string} phone
 */

/**
 * @typedef {Object} Incident
 * @property {string} id
 * @property {'Flood' | 'Road Block' | 'Rescue Needed'} type
 * @property {string} description
 * @property {string} timestamp
 * @property {{ lat: number, lng: number }} location
 * @property {string} reporter
 * @property {boolean} verified
 * @property {number} upvotes
 */
