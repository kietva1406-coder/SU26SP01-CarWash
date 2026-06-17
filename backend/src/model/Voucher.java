package model;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;

public class Voucher {
    private UUID id;
    private String code;
    private String description;
    private String discount_type; // PERCENT, FIXED_AMOUNT
    private BigDecimal discount_value;
    private BigDecimal max_discount_amount;
    private BigDecimal min_order_value;
    private int usage_limit;
    private int used_count;
    private int per_user_limit;
    private LocalDateTime valid_from;
    private LocalDateTime valid_until;
    private boolean is_active;
    private UUID created_by;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Voucher() {
    }

    public Voucher(String code, String discount_type, BigDecimal discount_value, UUID created_by) {
        this.id = UUID.randomUUID();
        this.code = code;
        this.discount_type = discount_type;
        this.discount_value = discount_value;
        this.created_by = created_by;
        this.is_active = true;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDiscount_type() { return discount_type; }
    public void setDiscount_type(String discount_type) { this.discount_type = discount_type; }

    public BigDecimal getDiscount_value() { return discount_value; }
    public void setDiscount_value(BigDecimal discount_value) { this.discount_value = discount_value; }

    public BigDecimal getMax_discount_amount() { return max_discount_amount; }
    public void setMax_discount_amount(BigDecimal max_discount_amount) { this.max_discount_amount = max_discount_amount; }

    public BigDecimal getMin_order_value() { return min_order_value; }
    public void setMin_order_value(BigDecimal min_order_value) { this.min_order_value = min_order_value; }

    public int getUsage_limit() { return usage_limit; }
    public void setUsage_limit(int usage_limit) { this.usage_limit = usage_limit; }

    public int getUsed_count() { return used_count; }
    public void setUsed_count(int used_count) { this.used_count = used_count; }

    public int getPer_user_limit() { return per_user_limit; }
    public void setPer_user_limit(int per_user_limit) { this.per_user_limit = per_user_limit; }

    public LocalDateTime getValid_from() { return valid_from; }
    public void setValid_from(LocalDateTime valid_from) { this.valid_from = valid_from; }

    public LocalDateTime getValid_until() { return valid_until; }
    public void setValid_until(LocalDateTime valid_until) { this.valid_until = valid_until; }

    public boolean isIs_active() { return is_active; }
    public void setIs_active(boolean is_active) { this.is_active = is_active; }

    public UUID getCreated_by() { return created_by; }
    public void setCreated_by(UUID created_by) { this.created_by = created_by; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }

    @Override
    public String toString() {
        return "Voucher{" + "id=" + id + ", code='" + code + '\'' + '}';
    }
}
