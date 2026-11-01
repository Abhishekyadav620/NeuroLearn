import apiClient from './api.js';

/**
 * Client Behaviour Service
 * Handles logging student learning interactions and event batching.
 */
export const behaviourService = {
  /**
   * Send a single learning behavioural event to the backend
   * @param {Object} eventPayload - { course, lessonId, sessionId, eventType, eventData }
   */
  async recordEvent(eventPayload) {
    try {
      const response = await apiClient.post('/behaviour/events', eventPayload);
      return response.data;
    } catch (error) {
      // Gracefully log without disrupting learner UI
      console.warn('[BehaviourTracking] Single event transmission skipped/failed:', error?.message);
      return null;
    }
  },

  /**
   * Send a batched array of learning behavioural events
   * @param {Array<Object>} events - Array of valid event objects
   */
  async recordBatchEvents(events) {
    if (!Array.isArray(events) || events.length === 0) return null;
    try {
      const response = await apiClient.post('/behaviour/events/batch', { events });
      return response.data;
    } catch (error) {
      console.warn('[BehaviourTracking] Batch event transmission skipped/failed:', error?.message);
      return null;
    }
  },
};

export default behaviourService;
