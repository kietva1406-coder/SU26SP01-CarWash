package model;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;

public class RefundVoucher {
    private UUID id;
    private UUID customer_id;
    private UUID booking_id;
    private String code;
    private BigDecimal amount_vnd;
    private BigDecimal original_amount_vnd;
    private String description;
    private LocalDateTime valid_from;
    private LocalDateTime valid_until;
    private boolean is_used;
    private LocalDateTime used_at;
    private UUID used_in_booking_id;
    private LocalDateTime created_at;

    public RefundVoucher() {}

    public RefundVoucher(UUID customer_id, UUID booking_id, String code, BigDecimal amount_vnd) {
        this.id = UUID.randomUUID();
        this.customer_id = customer_id;
        this.booking_id = booking_id;
        this.code = code;
        this.amount_vnd = amount_vnd;
        this.original_amount_vnd = amount_vnd;
        this.is_used = false;
        this.created_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCustomer_id() { return customer_id; }
    public void setCustomer_id(UUID customer_id) { this.customer_id = customer_id; }

    public UUID getBooking_id() { return booking_id; }
    public void setBooking_id(UUID booking_id) { this.booking_id = booking_id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public BigDecimal getAmount_vnd() { return amount_vnd; }
    public void setAmount_vnd(BigDecimal amount_vnd) { this.amount_vnd = amount_vnd; }

    public BigDecimal getOriginal_amount_vnd() { return original_amount_vnd; }
    public void setOriginal_amount_vnd(BigDecimal original_amount_vnd) { this.original_amount_vnd = original_amount_vnd; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getValid_from() { return valid_from; }
    public void setValid_from(LocalDateTime valid_from) { this.valid_from = valid_from; }

    public LocalDateTime getValid_until() { return valid_until; }
    public void setValid_until(LocalDateTime valid_until) { this.valid_until = valid_until; }

    public boolean isIs_used() { return is_used; }
    public void setIs_used(boolean is_used) { this.is_used = is_used; }

    public LocalDateTime getUsed_at() { return used_at; }
    public void setUsed_at(LocalDateTime used_at) { this.used_at = used_at; }

    public UUID getUsed_in_booking_id() { return used_in_booking_id; }
    public void setUsed_in_booking_id(UUID used_in_booking_id) { this.used_in_booking_id = used_in_booking_id; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    @Override
    public String toString() {
        return "RefundVoucher{" + "id=" + id + ", code='" + code + '\'' + ", amount=" + amount_vnd + '}';
    }
}
