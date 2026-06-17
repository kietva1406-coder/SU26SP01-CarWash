package model;

import java.util.UUID;

public class VoucherApplicableRank {
    private UUID id;
    private UUID voucher_id;
    private String rank_tier;

    public VoucherApplicableRank() {}

    public VoucherApplicableRank(UUID voucher_id, String rank_tier) {
        this.id = UUID.randomUUID();
        this.voucher_id = voucher_id;
        this.rank_tier = rank_tier;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getVoucher_id() { return voucher_id; }
    public void setVoucher_id(UUID voucher_id) { this.voucher_id = voucher_id; }

    public String getRank_tier() { return rank_tier; }
    public void setRank_tier(String rank_tier) { this.rank_tier = rank_tier; }

    @Override
    public String toString() {
        return "VoucherApplicableRank{" + "id=" + id + ", rank='" + rank_tier + '\'' + '}';
    }
}
