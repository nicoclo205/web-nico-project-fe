/**
 * @deprecated This file is deprecated. Use `apiClient` from '../utils/languageApi' instead.
 *
 * This export is kept for backwards compatibility but will be removed in a future version.
 * The new apiClient provides the same functionality plus language support.
 *
 * Migration guide:
 * - Replace: import api from './services/api';
 * - With: import { apiClient } from './utils/languageApi';
 * - Usage remains the same: apiClient.get(), apiClient.post(), etc.
 */

import { apiClient } from '../utils/languageApi';

// Re-export apiClient as default for backwards compatibility
export default apiClient;