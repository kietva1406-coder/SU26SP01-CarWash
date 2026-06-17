package model;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;

public class VoucherUsage {
    private UUID id;
    private UUID voucher_id;
    private String voucher_code;
    private UUID customer_id;
    private UUID booking_id;
    private BigDecimal original_amount;
    private BigDecimal discount_amount;
    private BigDecimal final_amount;
    private LocalDateTime used_at;

    public VoucherUsage() {}

    public VoucherUsage(UUID voucher_id, UUID customer_id, UUID booking_id, BigDecimal original_amount, BigDecimal discount_amount) {
        this.id = UUID.randomUUID();
        this.voucher_id = voucher_id;
        this.customer_id = customer_id;
        this.booking_id = booking_id;
        this.original_amount = original_amount;
        this.discount_amount = discount_amount;
        this.final_amount = original_amount.subtract(discount_amount);
        this.used_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getVoucher_id() { return voucher_id; }
    public void setVoucher_id(UUID voucher_id) { this.voucher_id = voucher_id; }

    public String getVoucher_code() { return voucher_code; }
    public void setVoucher_code(String voucher_code) { this.voucher_code = voucher_code; }

    public UUID getCustomer_id() { return customer_id; }
    public void setCustomer_id(UUID customer_id) { this.customer_id = customer_id; }

    public UUID getBooking_id() { return booking_id; }
    public void setBooking_id(UUID booking_id) { this.booking_id = booking_id; }

    public BigDecimal getOriginal_amount() { return original_amount; }
    public void setOriginal_amount(BigDecimal original_amount) { this.original_amount = original_amount; }

    public BigDecimal getDiscount_amount() { return discount_amount; }
    public void setDiscount_amount(BigDecimal discount_amount) { this.discount_amount = discount_amount; }

    public BigDecimal getFinal_amount() { return final_amount; }
    public void setFinal_amount(BigDecimal final_amount) { this.final_amount = final_amount; }

    public LocalDateTime getUsed_at() { return used_at; }
    public void setUsed_at(LocalDateTime used_at) { this.used_at = used_at; }

    @Override
    public String toString() {
        return "VoucherUsage{" + "id=" + id + ", discount=" + discount_amount + '}';
    }
}
