# Create a note

Create note lets a user save a titled note from the browser or CLI, cancel an unfinished draft, and confirm the saved note from a second user-facing view. An invalid title or a failed save keeps the draft and tells the user why.

## Sub-features

- `create-open` opens a blank editor from each browser entry point.
- `create-save` persists a title and body.
- `create-cancel` discards an unfinished browser draft.
- `create-cli` creates the same note shape from the terminal.
- `create-blank-title` keeps `Save note` disabled while the title is empty or whitespace.
- `create-title-limit` rejects a title over 120 characters with an inline error.
- `create-double-save` creates one note when `Save note` is chosen twice in quick succession.
- `create-save-error` keeps the draft and shows an error when the save request fails.

## How to get to it (user POV)

- Choose the `New note` button in the browser toolbar.
- Press `n` in the browser while focus is outside an editable field.
- Run `notes create --title <title> --body <body>` in a terminal.

## Driving it with control-notes

Preconditions:

- Notes is healthy at `http://127.0.0.1:4173`.
- No note is titled `Release checklist`, `Double save`, or `Offline draft`.
- `fixtures/title-121.txt` holds a 121-character title.
- `control-notes doctor` reports the expected URL and disposable data directory.

- **Open editor.** Choose `New note`. Run `control-notes browser click --role button --name "New note"`. A form named `Note editor` appears with focus in the `Title` textbox.
- **Enter content.** Type the title and body. Run `control-notes browser fill --role textbox --name "Title" --value "Release checklist"` and `control-notes browser fill --role textbox --name "Body" --value "Tag and publish"`. The `Save note` button becomes enabled.
- **Save note.** Choose `Save note`. Run `control-notes browser click --role button --name "Save note"`. A status named `Note saved` appears and the heading reads `Release checklist`.
- **Confirm persistence.** Return to the note list and reopen the note. Run `control-notes browser click --role link --name "All notes"` and `control-notes browser click --role link --name "Release checklist"`. The editor shows both saved values.
- **Cancel draft.** Open a new note, enter `Discard me`, and choose `Cancel`. Run `control-notes browser click --role button --name "New note"`, `control-notes browser fill --role textbox --name "Title" --value "Discard me"`, and `control-notes browser click --role button --name "Cancel"`. The note list returns and has no `Discard me` link.
- **Blank title.** Open a new note and enter only spaces as the title. Run `control-notes browser click --role button --name "New note"` and `control-notes browser fill --role textbox --name "Title" --value "   "`. `Save note` stays disabled.
- **Title limit.** Enter the 121-character title. Run `control-notes browser fill --role textbox --name "Title" --value-file fixtures/title-121.txt`. An alert named `Title is too long` appears and `Save note` stays disabled.
- **Double save.** Enter `Double save` and choose `Save note` twice in one action. Run `control-notes browser fill --role textbox --name "Title" --value "Double save"` and `control-notes browser dblclick --role button --name "Save note"`, then open the list with `control-notes browser click --role link --name "All notes"`. The list has exactly one `Double save` link.
- **Save error.** Make the save request fail, then save a new note. Run `control-notes browser block --url "**/api/notes" --status 500`, `control-notes browser click --role button --name "New note"`, `control-notes browser fill --role textbox --name "Title" --value "Offline draft"`, and `control-notes browser click --role button --name "Save note"`. An alert named `Could not save note` appears and the `Title` textbox still holds `Offline draft`. Run `control-notes browser unblock --url "**/api/notes"` before the next step.
- **CLI entry.** Create a second note. Run `control-notes cli -- notes create --title "CLI note" --body "Created from terminal" --format json`. Exit code `0` and stdout contain the new note ID and title.
- **Proof.** Open `All notes`. Run `control-notes browser click --role link --name "All notes"`, then `control-notes browser snapshot --aria --path artifacts/create-note/list.aria.txt` and `control-notes browser screenshot --path artifacts/create-note/list.png`. The artifacts show `Release checklist`, one `Double save`, and `CLI note`, and no `Offline draft`.

## Gotchas

- Pressing `n` while a textbox has focus types the character instead of opening a new editor.
- Titles are trimmed on save. Assert the rendered title, not the draft input value.
- A save status alone is insufficient proof. Reopen the note from the list.
- Two separate clicks let the first save finish before the second starts, which hides a duplicate-save bug. Use `dblclick`.
- A blocked request stays blocked until `unblock`. Every later save fails if you skip it.
- Remove `Release checklist`, `Double save`, and `CLI note` during fixture cleanup, but retain their proof artifacts.
