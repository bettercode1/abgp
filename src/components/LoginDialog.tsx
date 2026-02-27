import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { STATE_NAMES, getDistrictsForState } from '../lib/stateDistricts';
import { PRANT_KEYS } from '../lib/prantKeys';

type LoginRole = 'member' | 'director' | 'prant';
type MemberType = 'new' | 'existing';

interface LoginDialogProps {
    open: boolean;
    onClose: () => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const [role, setRole] = useState<LoginRole>('member');
    const [memberType, setMemberType] = useState<MemberType>('new');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [prant, setPrant] = useState('');
    const isDirectorOrPresident = role === 'director' || role === 'prant';
    const isExistingMember = !isDirectorOrPresident && memberType === 'existing';
    const districtOptions = state ? getDistrictsForState(state) : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={3} sx={{ mt: 0 }}>
                    {/* Login as: Director / President / Member */}
                    <Grid item xs={12}>
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body1" color="text.secondary">
                                    {t('login.role')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as LoginRole)}
                                    label={t('login.select')}
                                    InputLabelProps={{ shrink: true }}
                                >
                                    <MenuItem value="member">{t('login.roleCustomer')}</MenuItem>
                                    <MenuItem value="director">{t('login.roleDirector')}</MenuItem>
                                    <MenuItem value="prant">{t('login.rolePresident')}</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Director: only Email + Password */}
                    {role === 'director' && (
                        <>
                            <Grid item xs={12}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body1" color="text.secondary">
                                            {t('login.email')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            type="email"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body1" color="text.secondary">
                                            {t('login.password')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            type="password"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {/* Prant: Select Prant + Email + Password */}
                    {role === 'prant' && (
                        <>
                            <Grid item xs={12}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body1" color="text.secondary">
                                            {t('login.selectPrant')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            value={prant}
                                            onChange={(e) => setPrant(e.target.value)}
                                            label={t('login.select')}
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                        >
                                            {PRANT_KEYS.map((key) => (
                                                <MenuItem key={key} value={key}>
                                                    {t(`prant.${key}`)}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body1" color="text.secondary">
                                            {t('login.email')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            type="email"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body1" color="text.secondary">
                                            {t('login.password')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            type="password"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {/* Member: New or Existing + conditional fields */}
                    {!isDirectorOrPresident && (
                        <>
                            {/* New or Existing Member */}
                            <Grid item xs={12}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body1" color="text.secondary">
                                            {t('login.memberType')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            value={memberType}
                                            onChange={(e) => setMemberType(e.target.value as MemberType)}
                                            label={t('login.select')}
                                            InputLabelProps={{ shrink: true }}
                                        >
                                            <MenuItem value="new">{t('login.newMember')}</MenuItem>
                                            <MenuItem value="existing">{t('login.existingMember')}</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Existing Member: only Email + Phone */}
                            {isExistingMember && (
                                <>
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('login.email')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                    type="email"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('login.phone')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                            {/* New Member: full form */}
                            {!isExistingMember && (
                                <>
                                    {/* Full Name */}
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('login.fullName')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* State */}
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('login.state')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    value={state}
                                                    onChange={(e) => {
                                                        setState(e.target.value);
                                                        setDistrict('');
                                                    }}
                                                    label={t('login.select')}
                                                    InputLabelProps={{ shrink: true }}
                                                >
                                                    {STATE_NAMES.map((s) => (
                                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    {/* District Name */}
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('login.district')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    value={district}
                                                    onChange={(e) => setDistrict(e.target.value)}
                                                    label={t('login.select')}
                                                    InputLabelProps={{ shrink: true }}
                                                    disabled={!state}
                                                >
                                                    {districtOptions.map((d) => (
                                                        <MenuItem key={d} value={d}>{d}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* City/Taluk/Village */}
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('login.city')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Phone */}
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('login.phone')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Email */}
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {t('login.email')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
                <Button onClick={onClose} variant="contained" color="primary">
                    {t('login.button')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
