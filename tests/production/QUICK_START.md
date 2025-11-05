# QUICK START - PRODUCTION TEST SUITE

**For:** Backend and Frontend agents starting parallel test development  
**Time to read:** 2 minutes

---

## 🎯 Your Mission

Create production-ready test suite in `tests/production/` subdirectory.

---

## 📁 What's Already Done

✅ Directory structure planned  
✅ Documentation complete  
✅ Coordination guide ready  
✅ Cleanup script ready  
✅ Runner scripts ready

---

## 🚀 Backend Agent - Start Here

### 1. Read These (10 minutes)
- `tests/BACKEND_AUDIT_SUMMARY.md` - What to test
- `tests/BACKEND_TEST_CHECKLIST.md` - 140 test cases
- `tests/production/COORDINATION_GUIDE.md` - How to coordinate

### 2. Create Structure (5 minutes)
```bash
cd tests/production
mkdir -p backend/{unit,integration,e2e,security,performance,fixtures}
mkdir -p shared/{api-contract-tests,test-data/sample-files}
```

### 3. Start Coding (Week 1)
- Create `backend/conftest.py` with fixtures
- Create `backend/requirements.txt`
- Start with auth tests (HIGH priority)
- Document API contracts in `shared/api-contract-tests/`

### 4. Reference
- Templates: `tests/TEST_CASE_TEMPLATES.md`
- Checklist: `tests/BACKEND_TEST_CHECKLIST.md`

---

## 🚀 Frontend Agent - Start Here

### 1. Read These (10 minutes)
- `tests/FRONTEND_AUDIT_SUMMARY.md` - What to test
- `tests/FRONTEND_TEST_QUICK_REFERENCE.md` - Quick reference
- `tests/production/COORDINATION_GUIDE.md` - How to coordinate

### 2. Create Structure (5 minutes)
```bash
cd tests/production
mkdir -p frontend/{unit/{auth,invoice,menu,analysis},integration,e2e,fixtures}
mkdir -p shared/{api-contract-tests,test-data/sample-files}
```

### 3. Start Coding (Week 1)
- Create `frontend/package.json` with test deps
- Set up Jest/Vitest config
- Start with auth component tests
- Validate API contracts from `shared/api-contract-tests/`

### 4. Reference
- Quick ref: `tests/FRONTEND_TEST_QUICK_REFERENCE.md`

---

## 🤝 Coordination (5 minutes/day)

### Daily Check
1. Did I change any APIs? → Update `shared/api-contract-tests/`
2. Did I add test data? → Add to `shared/test-data/`
3. Any blockers? → Note in coordination guide

### That's It!
No meetings, no blocking, just quick async updates.

---

## ✅ When You're Done

### 1. Verify Your Tests
```bash
cd tests/production
./run_backend_tests.sh   # Backend agent
./run_frontend_tests.sh  # Frontend agent
```

### 2. Run Combined Suite
```bash
./run_all_tests.sh
```

### 3. Clean Up Old Tests
```bash
python cleanup_old_tests.py
```

### 4. Commit
```bash
git add tests/production/
git add -u  # Stage deletions
git commit -m "Production test suite complete"
git push
```

---

## 📊 Progress Tracking

### Backend Agent
- [ ] Week 1: Auth + Security (15 tests)
- [ ] Week 2: Invoice + Menu (45 tests)
- [ ] Week 3: Analysis + Comparison (40 tests)
- [ ] Week 4: Performance + Polish (15 tests)

### Frontend Agent
- [ ] Week 1: Auth + Forms
- [ ] Week 2: Invoice + Menu components
- [ ] Week 3: Analysis + Integration
- [ ] Week 4: E2E + Accessibility

---

## 🆘 Need Help?

### Backend Questions
- Check: `tests/BACKEND_AUDIT_SUMMARY.md`
- Templates: `tests/TEST_CASE_TEMPLATES.md`
- Checklist: `tests/BACKEND_TEST_CHECKLIST.md`

### Frontend Questions
- Check: `tests/FRONTEND_AUDIT_SUMMARY.md`
- Quick ref: `tests/FRONTEND_TEST_QUICK_REFERENCE.md`

### Coordination Questions
- Check: `tests/production/COORDINATION_GUIDE.md`

### General Questions
- Check: `tests/production/README.md`

---

## 🎉 That's It!

You have everything you need. Start coding! 🚀

**Estimated Time:**
- Setup: 30 minutes
- Development: 2-3 weeks
- Integration: 1 day
- Cleanup: 1 hour

**Total: ~3 weeks to production-ready test suite**
