import { supabase } from './supabaseClient'

// ==========================================
// TYPES
// ==========================================

export type ExamControlEvent =
  | {
      type: 'block'
      student_id: string
      session_token: string
      reason: string
    }
  | {
      type: 'unblock'
      student_id: string
      session_token: string
    }
  | {
      type: 'warning'
      student_id: string
      session_token: string
      message: string
    }

// ==========================================
// SUBSCRIBE (dipakai siswa)
// ==========================================

/**
 * Subscribe ke channel `exam-control-{scheduleId}`.
 * Return fungsi unsubscribe.
 */
export function subscribeExamControl(
  scheduleId: string,
  onEvent: (event: ExamControlEvent) => void
): () => void {
  const channelName = `exam-control-${scheduleId}`

  const channel = supabase
    .channel(channelName, {
      config: {
        broadcast: { self: true, ack: false },
      },
    })
    .on('broadcast', { event: 'control' }, (payload) => {
      try {
        const event = payload.payload as ExamControlEvent
        if (!event?.type) return
        onEvent(event)
      } catch (e) {
        console.warn('[exam-control] invalid payload', e)
      }
    })
    .subscribe((status) => {
      console.log(`[exam-control] ${channelName} status:`, status)
    })

  return () => {
    try {
      supabase.removeChannel(channel)
    } catch (e) {
      console.warn('[exam-control] failed to unsubscribe', e)
    }
  }
}

// ==========================================
// BROADCAST (dipakai admin, opsional)
// ==========================================

/**
 * Kirim event control ke channel. Dipakai dari frontend admin (opsional).
 * Kalau kontrol dari backend Go, lihat `sendExamBroadcast` di routes.go.
 */
export async function broadcastExamControl(
  scheduleId: string,
  event: ExamControlEvent
): Promise<void> {
  const channelName = `exam-control-${scheduleId}`

  // Buat channel ephemeral (kirim 1 event terus unsubscribe)
  const channel = supabase.channel(channelName)

  try {
    await channel.subscribe()
    await channel.send({
      type: 'broadcast',
      event: 'control',
      payload: event,
    })
  } finally {
    // Delay sedikit biar message terkirim
    setTimeout(() => {
      supabase.removeChannel(channel)
    }, 500)
  }
}