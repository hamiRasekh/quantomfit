'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export interface MentionOption {
  id: string;
  name: string;
  username?: string;
  type: 'admin' | 'item';
  sku?: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  adminOptions?: MentionOption[];
  itemOptions?: MentionOption[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder = 'یادداشت خود را بنویسید...',
  minRows = 4,
  maxRows = 8,
  maxLength = 1000,
  adminOptions = [],
  itemOptions = [],
  disabled = false,
  error = false,
  helperText,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<MentionOption[]>([]);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [mentionType, setMentionType] = useState<'admin' | 'item' | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Find mentions in text (@username or #itemId)
  const findMentions = useCallback((text: string): Array<{ start: number; end: number; type: 'admin' | 'item'; value: string }> => {
    const mentions: Array<{ start: number; end: number; type: 'admin' | 'item'; value: string }> = [];
    
    // Find @mentions
    const adminRegex = /@(\w+)/g;
    let match;
    while ((match = adminRegex.exec(text)) !== null) {
      mentions.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'admin',
        value: match[1],
      });
    }
    
    // Find #mentions
    const itemRegex = /#(\d+)/g;
    while ((match = itemRegex.exec(text)) !== null) {
      mentions.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'item',
        value: match[1],
      });
    }
    
    return mentions.sort((a, b) => a.start - b.start);
  }, []);

  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursorPos);
    
    // Check if we're typing a mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    const lastHash = textBeforeCursor.lastIndexOf('#');
    const lastMention = Math.max(lastAt, lastHash);
    
    if (lastMention !== -1) {
      const textAfterMention = textBeforeCursor.substring(lastMention + 1);
      const spaceIndex = textAfterMention.indexOf(' ');
      const newlineIndex = textAfterMention.indexOf('\n');
      const endIndex = spaceIndex !== -1 && newlineIndex !== -1 
        ? Math.min(spaceIndex, newlineIndex)
        : spaceIndex !== -1 
        ? spaceIndex 
        : newlineIndex !== -1 
        ? newlineIndex 
        : textAfterMention.length;
      
      const query = textAfterMention.substring(0, endIndex);
      
      // Check if mention is already completed (has space or newline after it)
      // If there's a space or newline immediately after @ or #, don't show autocomplete
      if (endIndex === 0 && (spaceIndex === 0 || newlineIndex === 0)) {
        setShowAutocomplete(false);
        return;
      }
      
      // Check if we're in the middle of a completed mention (space/newline found)
      if (spaceIndex !== -1 || newlineIndex !== -1) {
        // Mention is completed, don't show autocomplete
        setShowAutocomplete(false);
        return;
      }
      
      if (lastAt > lastHash) {
        // @ mention for admin
        setMentionType('admin');
        setMentionQuery(query);
        // Filter admin options by query (search in username and name)
        // Always show options, even if query is empty
        const filtered = query.trim() 
          ? adminOptions.filter(opt => {
              const searchQuery = query.toLowerCase();
              const usernameMatch = opt.username?.toLowerCase().includes(searchQuery) || 
                                   (opt.username && opt.username.toLowerCase().startsWith(searchQuery));
              const nameMatch = opt.name.toLowerCase().includes(searchQuery) || 
                               opt.name.toLowerCase().startsWith(searchQuery);
              return usernameMatch || nameMatch;
            })
          : adminOptions; // Show all if no query
        setAutocompleteOptions(filtered.slice(0, 10)); // Limit to 10 results
        setShowAutocomplete(filtered.length > 0 && adminOptions.length > 0);
      } else if (lastHash > lastAt) {
        // # mention for item
        setMentionType('item');
        setMentionQuery(query);
        // Filter item options by query (search in id, sku, and name)
        const filtered = query.trim()
          ? itemOptions.filter(opt => {
              const searchQuery = query.toLowerCase();
              return (
                opt.id.includes(query) ||
                opt.id.toLowerCase().includes(searchQuery) ||
                opt.sku?.toLowerCase().includes(searchQuery) ||
                opt.name.toLowerCase().includes(searchQuery) ||
                opt.id.startsWith(query) ||
                opt.name.toLowerCase().startsWith(searchQuery)
              );
            })
          : itemOptions; // Show all if no query
        setAutocompleteOptions(filtered.slice(0, 10)); // Limit to 10 results
        setShowAutocomplete(filtered.length > 0 && itemOptions.length > 0);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  }, [onChange, adminOptions, itemOptions]);

  // Handle autocomplete selection
  const handleSelectMention = useCallback((option: MentionOption) => {
    if (!textareaRef.current) return;
    
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    const lastAt = textBeforeCursor.lastIndexOf('@');
    const lastHash = textBeforeCursor.lastIndexOf('#');
    const lastMention = Math.max(lastAt, lastHash);
    
    if (lastMention !== -1) {
      const textBeforeMention = value.substring(0, lastMention);
      const mentionText = option.type === 'admin' 
        ? `@${option.username || option.name}`
        : `#${option.id}`;
      const newValue = textBeforeMention + mentionText + ' ' + textAfterCursor;
      
      // Close autocomplete immediately
      setShowAutocomplete(false);
      setMentionType(null);
      setMentionQuery('');
      setSelectedIndex(0);
      
      onChange(newValue);
      
      // Set cursor after mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = textBeforeMention.length + mentionText.length + 1;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
          setCursorPosition(newCursorPos);
        }
      }, 0);
    }
  }, [value, cursorPosition, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (showAutocomplete && autocompleteOptions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < autocompleteOptions.length - 1 ? prev + 1 : prev));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      } else if (e.key === 'Enter' && autocompleteOptions[selectedIndex]) {
        e.preventDefault();
        handleSelectMention(autocompleteOptions[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowAutocomplete(false);
        setMentionType(null);
        setMentionQuery('');
        setSelectedIndex(0);
        return;
      }
    }
    
    // If Enter is pressed without autocomplete, allow normal behavior
    // If Space is pressed and autocomplete is open, close it
    if (e.key === ' ' && showAutocomplete) {
      setShowAutocomplete(false);
      setMentionType(null);
      setMentionQuery('');
      setSelectedIndex(0);
    }
    
    // Update cursor position
    if (target && 'selectionStart' in target) {
      setCursorPosition(target.selectionStart || 0);
    }
  }, [showAutocomplete, autocompleteOptions, selectedIndex, handleSelectMention]);

  // Update autocomplete position - calculate exact cursor position
  useEffect(() => {
    if (showAutocomplete && textareaRef.current) {
      const textarea = textareaRef.current;
      
      // Get text before cursor
      const textBeforeCursor = value.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length - 1;
      const currentLineText = lines[currentLine] || '';
      
      // Get computed styles
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseFloat(computedStyle.lineHeight) || 24;
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
      const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
      
      // Create a temporary div to measure text width accurately
      const measureDiv = document.createElement('div');
      measureDiv.style.position = 'absolute';
      measureDiv.style.visibility = 'hidden';
      measureDiv.style.whiteSpace = 'pre-wrap';
      measureDiv.style.font = computedStyle.font;
      measureDiv.style.fontSize = computedStyle.fontSize;
      measureDiv.style.fontFamily = computedStyle.fontFamily;
      measureDiv.style.fontWeight = computedStyle.fontWeight;
      measureDiv.style.letterSpacing = computedStyle.letterSpacing;
      measureDiv.style.padding = '0';
      measureDiv.style.border = 'none';
      measureDiv.style.width = 'auto';
      measureDiv.style.height = 'auto';
      measureDiv.style.boxSizing = 'content-box';
      measureDiv.style.wordWrap = 'break-word';
      measureDiv.style.overflowWrap = 'break-word';
      measureDiv.textContent = currentLineText;
      
      document.body.appendChild(measureDiv);
      
      // Measure the actual text width on the current line
      const textWidth = measureDiv.offsetWidth;
      
      document.body.removeChild(measureDiv);
      
      // Calculate position relative to textarea container (the Box wrapper)
      const scrollTop = textarea.scrollTop;
      const topOffset = paddingTop + borderTop + (currentLine * lineHeight) + lineHeight - scrollTop;
      const leftOffset = paddingLeft + borderLeft + Math.min(textWidth, textarea.offsetWidth - paddingLeft * 2 - borderLeft * 2);
      
      setAutocompletePosition({
        top: topOffset,
        left: leftOffset,
      });
    }
  }, [showAutocomplete, cursorPosition, value]);

  // Render text with highlights
  const renderHighlightedText = useCallback((text: string) => {
    const mentions = findMentions(text);
    if (mentions.length === 0) {
      return text;
    }
    
    const parts: Array<{ text: string; highlight: boolean }> = [];
    let lastIndex = 0;
    
    mentions.forEach((mention) => {
      if (mention.start > lastIndex) {
        parts.push({ text: text.substring(lastIndex, mention.start), highlight: false });
      }
      parts.push({ text: text.substring(mention.start, mention.end), highlight: true });
      lastIndex = mention.end;
    });
    
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), highlight: false });
    }
    
    return parts.map((part, index) => (
      <span
        key={index}
        style={{
          backgroundColor: part.highlight ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
          fontWeight: part.highlight ? 600 : 'normal',
        }}
      >
        {part.text}
      </span>
    ));
  }, [findMentions]);

  const characterCount = value.length;
  const isOverLimit = maxLength ? characterCount > maxLength : false;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        inputRef={textareaRef}
        multiline
        minRows={minRows}
        maxRows={maxRows}
        fullWidth
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setCursorPosition(target.selectionStart || 0);
        }}
        placeholder={placeholder}
        disabled={disabled}
        error={error || isOverLimit}
        helperText={helperText || (maxLength ? `${characterCount}/${maxLength} کاراکتر` : undefined)}
        inputProps={{
          maxLength: maxLength,
        }}
        sx={{
          '& .MuiInputBase-root': {
            fontFamily: 'monospace',
          },
        }}
      />
      
      {/* Autocomplete dropdown */}
      {showAutocomplete && autocompleteOptions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: `${autocompletePosition.top}px`,
            left: `${autocompletePosition.left}px`,
            zIndex: 1300,
            maxHeight: 300,
            overflow: 'auto',
            minWidth: 300,
            maxWidth: 400,
            boxShadow: 3,
            mt: 0.5,
          }}
        >
          {mentionQuery && (
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                جستجو: {mentionQuery}
              </Typography>
            </Box>
          )}
          <List dense sx={{ py: 0.5 }}>
            {autocompleteOptions.map((option, index) => (
              <ListItem key={option.id} disablePadding>
                <ListItemButton 
                  onClick={() => handleSelectMention(option)}
                  selected={index === selectedIndex}
                  sx={{
                    py: 1,
                    px: 1.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {option.type === 'admin' ? `@${option.username || option.name}` : `#${option.id}`}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {option.name}
                        {option.type === 'item' && option.sku && ` - SKU: ${option.sku}`}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {autocompleteOptions.length >= 10 && (
              <Box sx={{ p: 1, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  {mentionType === 'admin' 
                    ? `${adminOptions.length} ادمین موجود است`
                    : `${itemOptions.length} محصول موجود است`}
                </Typography>
              </Box>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}

