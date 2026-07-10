import uuid
from django.db import models
from django.conf import settings


class ForensicLog(models.Model):
    """
    Forensic log table for tracking all security-sensitive actions and requests.
    Enables deep audit trails for regulatory and security forensics.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Event Category
    event_type = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Type of forensic event (e.g., login_success, login_failed, unauthorized_access, ticket_verify)"
    )
    
    # User linkage (optional for anonymous/failed actions)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="forensic_logs"
    )
    
    username_attempted = models.CharField(
        max_length=150,
        blank=True,
        help_text="The username input, especially useful for tracking brute-force failed login logs"
    )

    # Forensic metadata
    ip_address = models.GenericIPAddressField(db_index=True)
    user_agent = models.TextField(blank=True)
    path = models.CharField(max_length=500, blank=True)
    method = models.CharField(max_length=10, blank=True)
    
    # Description and payload audit
    description = models.TextField()
    payload = models.JSONField(
        default=dict,
        blank=True,
        help_text="JSON payload capturing structural metadata for the audited event (e.g., old vs new values)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "bs_forensic_logs"
        ordering = ["-created_at"]
        verbose_name = "Forensic Log"
        verbose_name_plural = "Forensic Logs"

    def __str__(self):
        return f"[{self.event_type.upper()}] {self.ip_address} - {self.description[:50]}"
