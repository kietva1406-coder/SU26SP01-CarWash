package model;

import java.util.UUID;

public class VoucherApplicableService {
    private UUID id;
    private UUID voucher_id;
    private UUID service_id;

    public VoucherApplicableService() {}

    public VoucherApplicableService(UUID voucher_id, UUID service_id) {
        this.id = UUID.randomUUID();
        this.voucher_id = voucher_id;
        this.service_id = service_id;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getVoucher_id() { return voucher_id; }
    public void setVoucher_id(UUID voucher_id) { this.voucher_id = voucher_id; }

    public UUID getService_id() { return service_id; }
    public void setService_id(UUID service_id) { this.service_id = service_id; }

    @Override
    public String toString() {
        return "VoucherApplicableService{" + "id=" + id + ", voucher_id=" + voucher_id + ", service_id=" + service_id + '}';
    }
}
