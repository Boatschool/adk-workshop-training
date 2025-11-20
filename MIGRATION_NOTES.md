# Project Consolidation - Migration Notes

**Date:** November 20, 2025

## What Changed

We consolidated two separate directories (`adk-workshop` and `adk-workshop-training`) into a single unified project directory.

## Files Migrated

From `~/Desktop/adk-workshop/` to `~/Desktop/adk-workshop-training/`:

1. **`.env`** - Contains Google API key configuration
2. **`start.sh`** → `start_visual_builder.sh` - Launch script
3. **`stop.sh`** → `stop_visual_builder.sh` - Stop script
4. **`restart.sh`** → `restart_visual_builder.sh` - Restart script
5. **`tasks/`** - Task definitions directory
6. **`google_api_setup_guide.md`** - API setup documentation

## Configuration Updates

### training_portal.py
- Added `python-dotenv` import
- Added automatic `.env` file loading on startup
- Environment variables now passed to Visual Builder subprocess
- Shows confirmation when GOOGLE_API_KEY is loaded

### .gitignore
- Added `.env` to prevent accidental API key commits
- Added `.adk-builder.pid` for script-generated files

### README.md
- Updated Quick Start instructions
- Documented `.env` setup as first step
- Added references to new shell scripts
- Clarified virtual environment location (`~/adk-workshop`)

## What Stayed the Same

- **Virtual environment location:** Still at `~/adk-workshop/` (home directory)
  - This is intentional - venv doesn't need to be in the project directory
  - All scripts and portal use: `source ~/adk-workshop/bin/activate`

- **Port numbers:**
  - Training portal: `http://localhost:5001`
  - Visual Builder: `http://localhost:8000/dev-ui`

## Benefits

✅ **Single directory** - No more switching between projects
✅ **One `.env` file** - API key in one location
✅ **Automatic loading** - Portal loads environment variables on startup
✅ **Better UX** - Stop/restart functionality built into portal
✅ **Backup scripts** - Shell scripts available as alternative
✅ **Git-safe** - `.env` properly excluded from version control

## Archived Files

- Original directories backed up as `.tar.gz` files on Desktop
- Old `adk-workshop` directory renamed to `adk-workshop.archived`
- Backups can be deleted once you verify everything works

## Testing Performed

✅ Training portal starts and loads `.env`
✅ GOOGLE_API_KEY detected and confirmed
✅ Visual Builder launches from portal with API key
✅ Stop functionality works correctly
✅ Status indicator updates properly
✅ All files migrated successfully

## How to Use

### Option 1: Training Portal (Recommended)
```bash
cd ~/Desktop/adk-workshop-training
source ~/adk-workshop/bin/activate
python training_portal.py
```

Visit http://localhost:5001 and use the Launch/Stop buttons.

### Option 2: Shell Scripts
```bash
cd ~/Desktop/adk-workshop-training
./start_visual_builder.sh    # Launch
./stop_visual_builder.sh     # Stop
./restart_visual_builder.sh  # Restart
```

## Troubleshooting

If you encounter issues:

1. **Verify `.env` exists:**
   ```bash
   cat ~/Desktop/adk-workshop-training/.env
   ```

2. **Check portal output:**
   - Should see: "✅ Loaded environment variables from .env"
   - Should see: "✅ GOOGLE_API_KEY is set"

3. **Verify virtual environment:**
   ```bash
   source ~/adk-workshop/bin/activate
   which python  # Should show ~/adk-workshop/bin/python
   ```

4. **Restore from backup if needed:**
   ```bash
   cd ~/Desktop
   tar -xzf adk-workshop-training.backup.tar.gz
   ```

## Next Steps

Once you've verified everything works:

1. Delete backup archives (optional):
   ```bash
   rm ~/Desktop/*.backup.tar.gz
   ```

2. Delete archived directory (optional):
   ```bash
   rm -rf ~/Desktop/adk-workshop.archived
   ```

3. Commit changes to git:
   ```bash
   cd ~/Desktop/adk-workshop-training
   git add .
   git commit -m "Consolidate project: merge adk-workshop launcher into training portal"
   ```

---

**Migration completed successfully!** 🎉
