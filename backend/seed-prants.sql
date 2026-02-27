-- ABGP Backend - Seed 38 Prant logins + 1 Director
-- Each account has a UNIQUE password. See prant-passwords.csv for the list.
-- Run AFTER schema.sql.

-- =============================================================================
-- 1 DIRECTOR
-- Password: Director-ABGP-2025
-- =============================================================================
INSERT INTO users (id, email, password_hash, role, prant, name, contact_number, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'director@abgpindia.com',
  '$2b$10$rz4cm2SpcBPM2wfyOlM4Ou6oBHYPho.YTNEAJ3/vPbiilczwpi4s.',
  'director',
  NULL,
  'ABGP Director',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 38 PRANT LOGINS (password pattern: Prant-<prantKey>-2025)
-- =============================================================================
INSERT INTO users (id, email, password_hash, role, prant, name, contact_number, created_at, updated_at) VALUES
('b0000001-0000-0000-0000-000000000001', 'prant-andhra@abgpindia.com', '$2b$10$Wa6v.fBnARQ8E4YwwPM1WuqxJZYAZk0YcK9U3KYLTlL4kMpeBLEpy', 'prant', 'andhra', 'Prant Andhra', NULL, NOW(), NOW()),
('b0000002-0000-0000-0000-000000000002', 'prant-arunachal@abgpindia.com', '$2b$10$6z2tetMEjY3g1IlU/WSNM.iBDdWR3sEWeS3rxs2tSM/VgX1xrHSQ2', 'prant', 'arunachal', 'Prant Arunachal', NULL, NOW(), NOW()),
('b0000003-0000-0000-0000-000000000003', 'prant-assam@abgpindia.com', '$2b$10$ztulqTK46buBYH4OKGHllOnwDe6lAFTGRHyDYKbtssvSH3vuAY23G', 'prant', 'assam', 'Prant Assam', NULL, NOW(), NOW()),
('b0000004-0000-0000-0000-000000000004', 'prant-bihar-dakshin@abgpindia.com', '$2b$10$a3cGA4LXrDV0uDNRQ/mpK.3VUGQbG7sCMcl6cwZIz0Gbcbi5tuBcS', 'prant', 'biharDakshin', 'Prant Bihar Dakshin', NULL, NOW(), NOW()),
('b0000005-0000-0000-0000-000000000005', 'prant-bihar-uttar@abgpindia.com', '$2b$10$7sdjOdr5nrqcvrfEC3xsOOrco7ipjfb3cB1MG.0zg2111DsbNQBZW', 'prant', 'biharUttar', 'Prant Bihar Uttar', NULL, NOW(), NOW()),
('b0000006-0000-0000-0000-000000000006', 'prant-chattisgarh@abgpindia.com', '$2b$10$Hn8dox1f8d3AJHXxEjBWEuxMxEbmVzJpQv5jHeR6gEhG/zWV71sam', 'prant', 'chattisgarh', 'Prant Chattisgarh', NULL, NOW(), NOW()),
('b0000007-0000-0000-0000-000000000007', 'prant-delhi@abgpindia.com', '$2b$10$qT2SymjJO8ydXMLP78St0uzyu4yMUFSCv5QWC3lPv1YcAExETKlEC', 'prant', 'delhi', 'Prant Delhi', NULL, NOW(), NOW()),
('b0000008-0000-0000-0000-000000000008', 'prant-gujarat@abgpindia.com', '$2b$10$A/bQ65K9DjhMK7ittoJ8YOTo1rDE/1uzktKBIyl6h15gt2zvdqZ9K', 'prant', 'gujarat', 'Prant Gujarat', NULL, NOW(), NOW()),
('b0000009-0000-0000-0000-000000000009', 'prant-haryana@abgpindia.com', '$2b$10$aM0w93htYN6guof1BOg7TOIWYE3hjxlzp.pIBZljJxSnXU8dY7BKW', 'prant', 'haryana', 'Prant Haryana', NULL, NOW(), NOW()),
('b0000010-0000-0000-0000-000000000010', 'prant-himachal@abgpindia.com', '$2b$10$S9tYmbG3rL8Goc.XqUmdjeT/9OEIyomhdVNT5Z67YRtu9EtWAnvCS', 'prant', 'himachal', 'Prant Himachal', NULL, NOW(), NOW()),
('b0000011-0000-0000-0000-000000000011', 'prant-jammu-kashmir@abgpindia.com', '$2b$10$reB5INnKk1hRZ0v2nY1v9u1ceQUZSf5i3b5YqpYm6/bDNkoEOM5VK', 'prant', 'jammuKashmir', 'Prant Jammu Kashmir', NULL, NOW(), NOW()),
('b0000012-0000-0000-0000-000000000012', 'prant-jharkhand@abgpindia.com', '$2b$10$6qi7pX/4gbcp3ACERW88deVSRe5thqL5fXAxNrk3D7aweVz674YWS', 'prant', 'jharkhand', 'Prant Jharkhand', NULL, NOW(), NOW()),
('b0000013-0000-0000-0000-000000000013', 'prant-karnataka@abgpindia.com', '$2b$10$ii/n.V8I.RF7gsjcTgEWD.AhWSUuIoC3wo8T9IUjCzDA/Fh5t8aL.', 'prant', 'karnataka', 'Prant Karnataka', NULL, NOW(), NOW()),
('b0000014-0000-0000-0000-000000000014', 'prant-kerala@abgpindia.com', '$2b$10$OVcAQPbjNKxAnA2VKn3mXOTqqspNMYOygZoaJpBdOJskh4.4WX8zm', 'prant', 'kerala', 'Prant Kerala', NULL, NOW(), NOW()),
('b0000015-0000-0000-0000-000000000015', 'prant-mp-madhyabharat@abgpindia.com', '$2b$10$zReryu8UaRNtOsPm9GFOm.r4bWNnzoBdD8GDTGZYcrqcRkYnQjDmW', 'prant', 'mpMadhyabharat', 'Prant Mp Madhyabharat', NULL, NOW(), NOW()),
('b0000016-0000-0000-0000-000000000016', 'prant-mp-mahakaushal@abgpindia.com', '$2b$10$1TG9JfI6xCzLLx2d3WzLGutpuK77KlxNtIcFvVczQR12iX7fKYaIe', 'prant', 'mpMahakaushal', 'Prant Mp Mahakaushal', NULL, NOW(), NOW()),
('b0000017-0000-0000-0000-000000000017', 'prant-mp-malwa@abgpindia.com', '$2b$10$937PdZTKgssF/Shmt4H7N.ceWw6IhVHwU8oIzQ76OACtwQC53cfzS', 'prant', 'mpMalwa', 'Prant Mp Malwa', NULL, NOW(), NOW()),
('b0000018-0000-0000-0000-000000000018', 'prant-maharashtra-devgiri@abgpindia.com', '$2b$10$rt/kLYsmtcnBxgcFVo/1QeYxkiB8KlE8SAWxrLqwaLc041ZUwkSL6', 'prant', 'maharashtraDevgiri', 'Prant Maharashtra Devgiri', NULL, NOW(), NOW()),
('b0000019-0000-0000-0000-000000000019', 'prant-maharashtra-konkan@abgpindia.com', '$2b$10$s6JutlSNbroBgY0B0tbb7O76irkOKmJ9ttGdRx41SoQ3V0W3Qc0ja', 'prant', 'maharashtraKonkan', 'Prant Maharashtra Konkan', NULL, NOW(), NOW()),
('b0000020-0000-0000-0000-000000000020', 'prant-madhya-maharashtra@abgpindia.com', '$2b$10$dQu30BBkxE4HaU7eDVH4yeWcuwUiwn3lpwW0avOvokWXXZ5LVagCy', 'prant', 'madhyaMaharashtra', 'Prant Madhya Maharashtra', NULL, NOW(), NOW()),
('b0000021-0000-0000-0000-000000000021', 'prant-maharashtra-vidharbh@abgpindia.com', '$2b$10$xcfeHcos7gfoQkg8O0gV..692RyzJO.Cz4vj.iV9HYqSLWzUwPCFy', 'prant', 'maharashtraVidharbh', 'Prant Maharashtra Vidharbh', NULL, NOW(), NOW()),
('b0000022-0000-0000-0000-000000000022', 'prant-meghalaya@abgpindia.com', '$2b$10$R8i7Q7/XtsD6euYjFce6K.2XNxVjLpOoZkJkXgggsJFQH7JyZDTue', 'prant', 'meghalaya', 'Prant Meghalaya', NULL, NOW(), NOW()),
('b0000023-0000-0000-0000-000000000023', 'prant-odisha-pashchim@abgpindia.com', '$2b$10$1W0wODLGpn5T2Ft/Vg.a1eEKPnWZRdfQvfm2Ls4Y9/VtMYuJFkB3u', 'prant', 'odishaPashchim', 'Prant Odisha Pashchim', NULL, NOW(), NOW()),
('b0000024-0000-0000-0000-000000000024', 'prant-odisha-purba@abgpindia.com', '$2b$10$8TvWh7dkzpQ9i1QvKw5Qfe7awovqQbVDiM1kfSteOm.E6TEAGs17W', 'prant', 'odishaPurba', 'Prant Odisha Purba', NULL, NOW(), NOW()),
('b0000025-0000-0000-0000-000000000025', 'prant-punjab@abgpindia.com', '$2b$10$yGYRIlehWNu51nG.txepP.2yyAAF.rS.JhTkpcZfOMAk6q42DVC2O', 'prant', 'punjab', 'Prant Punjab', NULL, NOW(), NOW()),
('b0000026-0000-0000-0000-000000000026', 'prant-rajasthan-chittor@abgpindia.com', '$2b$10$.dmAHdDltNuB2Cw9JFfFBuSNkhnVObOZP3uETEDRsYhBbSQkAtFEi', 'prant', 'rajasthanChittor', 'Prant Rajasthan Chittor', NULL, NOW(), NOW()),
('b0000027-0000-0000-0000-000000000027', 'prant-rajasthan-jaipur@abgpindia.com', '$2b$10$Sm4ocU8cZQ18aYoveCkhC.rDgSNAhBXtKCXMh/fYt9ZEntLZJcYEG', 'prant', 'rajasthanJaipur', 'Prant Rajasthan Jaipur', NULL, NOW(), NOW()),
('b0000028-0000-0000-0000-000000000028', 'prant-rajasthan-jodhpur@abgpindia.com', '$2b$10$kR8RkhJGt2GDUgjXD.3ENufL2mV5Yy0e4S4s/rfeEJz1UInXKac2i', 'prant', 'rajasthanJodhpur', 'Prant Rajasthan Jodhpur', NULL, NOW(), NOW()),
('b0000029-0000-0000-0000-000000000029', 'prant-sikkim@abgpindia.com', '$2b$10$OPqOMU3zXe0E8BpDhjxqH.X7ub/WOJyRavqlLDatd50jvUaQ5NO6K', 'prant', 'sikkim', 'Prant Sikkim', NULL, NOW(), NOW()),
('b0000030-0000-0000-0000-000000000030', 'prant-tamilnadu-dakshin@abgpindia.com', '$2b$10$zZBCSyW/3OCvB55HJxmA4eGW5rYnlG.p1aR6OP2VU34xCha4w8dZG', 'prant', 'tamilnaduDakshin', 'Prant Tamilnadu Dakshin', NULL, NOW(), NOW()),
('b0000031-0000-0000-0000-000000000031', 'prant-tamilnadu-uttar@abgpindia.com', '$2b$10$69Z/1Aj9FJHuJlnVHC2qPefxsr02SKR0oKWsCwYq8zmSbi6OTYLg6', 'prant', 'tamilnaduUttar', 'Prant Tamilnadu Uttar', NULL, NOW(), NOW()),
('b0000032-0000-0000-0000-000000000032', 'prant-telangana@abgpindia.com', '$2b$10$Cib54NYgmzfOaWPIXIi.4uBr/4XFZ.Jwn8awPNSvQGqdDvkPm.i0y', 'prant', 'telangana', 'Prant Telangana', NULL, NOW(), NOW()),
('b0000033-0000-0000-0000-000000000033', 'prant-up-avadh@abgpindia.com', '$2b$10$Dvl6..u24gxEou9odauvvOwkhw/h1WyaHBz.oNiOum1AKCUbHdvk2', 'prant', 'upAvadh', 'Prant Up Avadh', NULL, NOW(), NOW()),
('b0000034-0000-0000-0000-000000000034', 'prant-up-braj@abgpindia.com', '$2b$10$okgzRuaDj9ZGjmQ.lqUXjO606yRhvS3UjgALvRC8lECwRug9Ct/5G', 'prant', 'upBraj', 'Prant Up Braj', NULL, NOW(), NOW()),
('b0000035-0000-0000-0000-000000000035', 'prant-up-goraksha@abgpindia.com', '$2b$10$yKNJU5BRpq7zcKBk2l/K8.o0373CJx3kBQJQDX4rhUwuMbfs5FUe.', 'prant', 'upGoraksha', 'Prant Up Goraksha', NULL, NOW(), NOW()),
('b0000036-0000-0000-0000-000000000036', 'prant-up-kanpur@abgpindia.com', '$2b$10$mBKHI4AruICmVcr2fqIoIOW5.Z.6su4SJowJuRmBHt6Xkch6km.U2', 'prant', 'upKanpur', 'Prant Up Kanpur', NULL, NOW(), NOW()),
('b0000037-0000-0000-0000-000000000037', 'prant-up-kashi@abgpindia.com', '$2b$10$ykND1Vu7L8UQIP5rS.UYeeiFPn5A2vB83VS45noXQLeabR.6nNPIq', 'prant', 'upKashi', 'Prant Up Kashi', NULL, NOW(), NOW()),
('b0000038-0000-0000-0000-000000000038', 'prant-up-meerut@abgpindia.com', '$2b$10$FnzAo0ogavIG0PZnJ4eiOO8tsA9GmLPRgHH/mDvhuuRGrTA1hs/ze', 'prant', 'upMeerut', 'Prant Up Meerut', NULL, NOW(), NOW()),
('b0000039-0000-0000-0000-000000000039', 'prant-uttarakhand@abgpindia.com', '$2b$10$MxaOIYLr50CrKiBd0k70QOwukCPYC4vTWtSRNo3SG8kopXosTCxZq', 'prant', 'uttarakhand', 'Prant Uttarakhand', NULL, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
