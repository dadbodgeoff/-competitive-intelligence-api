# New Dashboard - Quick Start Guide

## 🚀 Access the Dashboard

**URL**: http://localhost:5173/dashboard

## ✅ What's Running

```
✅ API: http://localhost:8000
✅ Frontend: http://localhost:5173
✅ Redis: localhost:6379
```

## 🎨 New Features

### Sidebar Navigation
- **Main**: Dashboard, New Analysis
- **Features**: Invoices, Menu, Menu Comparison, Price Analytics
- **Reports**: Saved Analyses, Saved Comparisons

### Dashboard Widgets
- **KPI Cards**: Items Tracked, Active Vendors, Savings, Anomalies
- **Usage Limits**: Weekly usage tracking
- **Quick Actions**: 4 main feature cards
- **Recent Activity**: Timeline of recent actions

### Design
- Modern shadcn/ui components
- Dark theme with emerald/cyan accents
- Fully responsive (mobile-friendly)
- Collapsible sidebar

## 🔄 Docker Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart
docker-compose -f docker-compose.dev.yml restart

# Stop
docker-compose -f docker-compose.dev.yml down

# Rebuild
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

## 📝 Notes

- Old dashboard preserved at `/dashboard/old`
- All existing routes still work
- No breaking changes to API
- Mobile responsive with sheet drawer

## 🐛 Troubleshooting

**Dashboard not loading?**
- Check logs: `docker-compose -f docker-compose.dev.yml logs frontend`
- Verify port 5173 is not in use
- Try: `docker-compose -f docker-compose.dev.yml restart frontend`

**API errors?**
- Check logs: `docker-compose -f docker-compose.dev.yml logs api`
- Verify .env file has correct credentials
- Check Redis is running

**Need to rollback?**
- Edit `frontend/src/App.tsx`
- Change route to use `DashboardPage` instead of `DashboardPageNew`
- Restart frontend

## 📚 Documentation

- `DASHBOARD_UPGRADE_COMPLETE.md` - Full implementation details
- `DASHBOARD_UPGRADE_AUDIT.md` - Pre-implementation audit
- `DASHBOARD_UPGRADE_SUMMARY.md` - Implementation summary

---

**Status**: ✅ RUNNING
**Version**: shadcn/ui Modern Dashboard v1.0
**Last Updated**: 2025-11-04
