<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationDecisionNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $decision,
        public readonly ?string $reason = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $approved = $this->decision === 'approved';
        $mail = (new MailMessage)
            ->subject($approved ? 'MSV membership approved' : 'MSV membership application update')
            ->greeting('Hello '.$notifiable->first_name.',')
            ->line($approved
                ? 'Your MSV membership application has been approved.'
                : 'Your MSV membership application was not approved.');

        if ($this->reason) {
            $mail->line('Reason: '.$this->reason);
        }

        return $approved
            ? $mail->action('Open member portal', route('dashboard'))
            : $mail->line('Contact an MSV administrator if you need clarification.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'application_decision',
            'decision' => $this->decision,
            'reason' => $this->reason,
            'message' => $this->decision === 'approved'
                ? 'Your membership application was approved.'
                : 'Your membership application was rejected.',
        ];
    }
}
