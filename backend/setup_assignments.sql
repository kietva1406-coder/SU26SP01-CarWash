CREATE TABLE RequestAssignments (
    requestId UNIQUEIDENTIFIER NOT NULL,
    staffId VARCHAR(50) NOT NULL, -- UUID or String based on your Users table id type
    assignedBy VARCHAR(50) NOT NULL,
    assignedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (requestId, staffId),
    -- FOREIGN KEY (requestId) REFERENCES Requests(id)
    -- FOREIGN KEY (staffId) REFERENCES Users(id)
);
