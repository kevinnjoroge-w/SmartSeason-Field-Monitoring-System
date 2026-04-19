/**
 * Field status derivation logic (computed — never stored in DB).
 *
 * Rules:
 *   Completed → stage is 'Harvested'
 *   At Risk   → stage is 'Planted' or 'Growing' AND planting_date is more than 90 days ago
 *   Active    → everything else
 */

const RISK_THRESHOLD_DAYS = 90;

/**
 * Derives the field status from its stage and planting date.
 * @param {string} stage          - One of: Planted, Growing, Ready, Harvested
 * @param {Date|string} plantingDate
 * @returns {'Completed'|'At Risk'|'Active'}
 */
function deriveFieldStatus(stage, plantingDate) {
  if (stage === 'Harvested') return 'Completed';

  const planted = new Date(plantingDate);
  const now = new Date();
  const diffMs   = now - planted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if ((stage === 'Planted' || stage === 'Growing') && diffDays > RISK_THRESHOLD_DAYS) {
    return 'At Risk';
  }

  return 'Active';
}

/**
 * Attaches a computed `status` field to a field row object.
 * @param {object} fieldRow - Row from the fields table
 * @returns {object} - fieldRow with status appended
 */
function withStatus(fieldRow) {
  return {
    ...fieldRow,
    status: deriveFieldStatus(fieldRow.stage, fieldRow.planting_date),
  };
}

/**
 * Applies withStatus to an array of field rows.
 * @param {object[]} rows
 * @returns {object[]}
 */
function withStatusAll(rows) {
  return rows.map(withStatus);
}

module.exports = { deriveFieldStatus, withStatus, withStatusAll };
